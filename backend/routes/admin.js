const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Complaint = require('../models/Complaint');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { sendStatusEmail } = require('../services/emailService');

// ───────────────────────────────────────────────
// GET /api/admin/complaints
// ───────────────────────────────────────────────
router.get('/complaints', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const query = req.user.role === 'dept_admin' ? { assignedDept: req.user.department } : {};
    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// GET /api/admin/workers
// ───────────────────────────────────────────────
router.get('/workers', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const query = { role: 'worker' };
    if (req.user.role === 'dept_admin') {
      let dept = req.user.department;
      if (!dept) {
        const u = await User.findById(req.user.id).select('department');
        dept = u?.department;
      }
      if (dept) query.department = dept;
    }
    const workers = await User.find(query).select('name phone email role department');
    res.json(workers);
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/workers
router.post('/workers', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const { name, phone, email, password, department } = req.body;
    if (!name || !phone) {
      return res.status(400).json({ message: 'Name and phone are required' });
    }
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(409).json({ message: 'A user with this phone number already exists' });
    }
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password || 'password', salt);

    let workerDept = department;
    if (req.user.role === 'dept_admin') {
      let dept = req.user.department;
      if (!dept) {
        const u = await User.findById(req.user.id).select('department');
        dept = u?.department;
      }
      if (dept) workerDept = dept;
    }
    if (!workerDept) workerDept = 'Roads & Infrastructure Dept';

    const worker = new User({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : `${name.toLowerCase().replace(/\s+/g, '')}@smartcity.gov`,
      password: hashedPassword,
      role: 'worker',
      department: workerDept
    });
    await worker.save();
    res.status(201).json(worker);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/workers/:id — Update field worker credentials
router.put('/workers/:id', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const { name, phone, email, password, department } = req.body;
    const worker = await User.findById(req.params.id);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found.' });
    }
    if (name) worker.name = name.trim();
    if (phone && phone !== worker.phone) {
      const existing = await User.findOne({ phone, _id: { $ne: worker._id } });
      if (existing) return res.status(409).json({ message: 'Phone number already in use.' });
      worker.phone = phone.trim();
    }
    if (email && email !== worker.email) {
      worker.email = email.trim();
    }
    if (department) worker.department = department;
    if (password && password.trim().length > 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      worker.password = await bcrypt.hash(password, salt);
    }
    await worker.save();
    const result = worker.toObject();
    delete result.password;
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/workers/:id — Delete field worker
router.delete('/workers/:id', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const worker = await User.findById(req.params.id);
    if (!worker || worker.role !== 'worker') {
      return res.status(404).json({ message: 'Worker not found.' });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Worker deleted successfully.', workerId: req.params.id });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// PUT /api/admin/complaints/:id/status — Admin Status Update
// ───────────────────────────────────────────────
router.put('/complaints/:id/status', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Submitted', 'Under Review', 'In Progress', 'Resolved', 'Rejected', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    const prevStatus = complaint.status;

    // Only proceed if status actually changed
    if (prevStatus === status) {
      return res.json({ message: 'Status is unchanged.', complaint });
    }

    complaint.status = status;
    await complaint.save();

    // Trigger Web Push Notification to Complaint Owner
    sendPushNotificationToUser(complaint.citizenId, {
      title: `Complaint Status Updated: #${complaint._id.toString().slice(-6)}`,
      body: getStatusMessage(complaint.issueType, prevStatus, status),
      icon: '/icon-192.png',
      data: {
        url: `/track?id=${complaint._id}`,
        complaintId: complaint._id.toString(),
        prevStatus,
        newStatus: status
      }
    });

    // Notify citizen via Email
    const citizen = await User.findById(complaint.citizenId);
    if (citizen?.email) {
      await sendStatusEmail({
        to: citizen.email,
        name: citizen.name,
        complaintId: complaint._id,
        status,
        issueType: complaint.issueType,
        deadline: complaint.deadline,
      });
    }

    res.json(complaint);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// PUT /api/admin/complaints/:id/assign
// ───────────────────────────────────────────────
router.put('/complaints/:id/assign', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const { workerId } = req.body;
    if (!workerId) return res.status(400).json({ message: 'Please specify workerId.' });

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== 'worker') {
      return res.status(400).json({ message: 'Invalid worker selection.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    const prevStatus = complaint.status;
    const newStatus = 'In Progress';

    complaint.assignedWorker = worker._id;
    complaint.status = newStatus;
    await complaint.save();

    // Send push notification if status changed
    if (prevStatus !== newStatus) {
      sendPushNotificationToUser(complaint.citizenId, {
        title: `Complaint Worker Assigned: #${complaint._id.toString().slice(-6)}`,
        body: `A worker (${worker.name}) has been assigned to your ${complaint.issueType} complaint. Status: In Progress.`,
        icon: '/icon-192.png',
        data: {
          url: `/track?id=${complaint._id}`,
          complaintId: complaint._id.toString(),
          prevStatus,
          newStatus
        }
      });
    }

    // Notify the citizen of status change via Email
    const citizen = await User.findById(complaint.citizenId);
    if (citizen?.email) {
      await sendStatusEmail({
        to: citizen.email,
        name: citizen.name,
        complaintId: complaint._id,
        status: newStatus,
        issueType: complaint.issueType,
        deadline: complaint.deadline,
      });
    }

    res.json(complaint);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// GET /api/admin/users  (Super Admin only)
// Excludes citizens; returns Dept Admins, Workers, and Super Admins enriched with work history
// ───────────────────────────────────────────────
router.get('/users', verifyToken, checkRole('super_admin'), async (req, res, next) => {
  try {
    const users = await User.find({ role: { $in: ['dept_admin', 'worker', 'super_admin'] } })
      .select('-password')
      .sort({ createdAt: -1 });

    const complaints = await Complaint.find({})
      .select('assignedWorker assignedDept status issueType location description updatedAt createdAt')
      .sort({ updatedAt: -1 });

    const allWorkers = await User.find({ role: 'worker' }).select('department');

    const enrichedUsers = users.map(u => {
      const userObj = u.toObject();
      if (u.role === 'worker') {
        const workerIdStr = u._id.toString();
        const workerComplaints = complaints.filter(c => (c.assignedWorker?.toString() === workerIdStr));
        const resolved = workerComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
        const inProgress = workerComplaints.filter(c => c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Pending');
        userObj.workSummary = {
          type: 'worker',
          totalAssigned: workerComplaints.length,
          resolvedCount: resolved.length,
          inProgressCount: inProgress.length,
          resolutionRate: workerComplaints.length > 0 ? Math.round((resolved.length / workerComplaints.length) * 100) : 0,
          recentTasks: workerComplaints.slice(0, 8).map(t => ({
            id: t._id,
            issueType: t.issueType,
            status: t.status,
            address: t.location?.address || 'Navi Mumbai',
            description: t.description,
            date: t.updatedAt || t.createdAt
          }))
        };
      } else if (u.role === 'dept_admin') {
        const deptComplaints = complaints.filter(c => c.assignedDept === u.department);
        const resolved = deptComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
        const active = deptComplaints.filter(c => c.status === 'In Progress' || c.status === 'Under Review' || c.status === 'Pending' || c.status === 'Submitted');
        const deptWorkers = allWorkers.filter(w => w.department === u.department).length;
        userObj.workSummary = {
          type: 'dept_admin',
          department: u.department,
          totalDepartmentComplaints: deptComplaints.length,
          resolvedCount: resolved.length,
          activeCount: active.length,
          activeWorkersCount: deptWorkers,
          resolutionRate: deptComplaints.length > 0 ? Math.round((resolved.length / deptComplaints.length) * 100) : 0,
          recentTasks: deptComplaints.slice(0, 8).map(t => ({
            id: t._id,
            issueType: t.issueType,
            status: t.status,
            address: t.location?.address || 'Navi Mumbai',
            description: t.description,
            date: t.updatedAt || t.createdAt
          }))
        };
      } else if (u.role === 'super_admin') {
        const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed');
        userObj.workSummary = {
          type: 'super_admin',
          cityTotalComplaints: complaints.length,
          cityResolvedCount: resolved.length,
          resolutionRate: complaints.length > 0 ? Math.round((resolved.length / complaints.length) * 100) : 0,
          departmentsGoverned: 4,
          recentTasks: complaints.slice(0, 8).map(t => ({
            id: t._id,
            issueType: t.issueType,
            status: t.status,
            address: t.location?.address || 'Navi Mumbai',
            description: t.description,
            date: t.updatedAt || t.createdAt
          }))
        };
      }
      return userObj;
    });

    res.json(enrichedUsers);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// PUT /api/admin/users/:id/role  (Super Admin only)
// ───────────────────────────────────────────────
router.put('/users/:id/role', verifyToken, checkRole('super_admin'), async (req, res, next) => {
  try {
    const { role, department } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    user.role = role || user.role;
    if (department !== undefined) user.department = department;
    await user.save();
    res.json({ _id: user._id, name: user.name, role: user.role, department: user.department });
  } catch (err) {
    next(err);
  }
});

// POST /api/admin/users — Super Admin creates any user (Dept Admin, Worker, Citizen)
router.post('/users', verifyToken, checkRole('super_admin'), async (req, res, next) => {
  try {
    const { name, phone, email, password, role, department } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ message: 'Name, phone, and password are required.' });
    }
    const existing = await User.findOne({ phone: phone.trim() });
    if (existing) {
      return res.status(409).json({ message: 'A user with this phone number already exists.' });
    }
    if (email) {
      const existingEmail = await User.findOne({ email: email.trim() });
      if (existingEmail) {
        return res.status(409).json({ message: 'A user with this email already exists.' });
      }
    }
    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : `${name.toLowerCase().replace(/\s+/g, '')}@smartcity.gov`,
      password: hashedPassword,
      role: role || 'dept_admin',
      department: department || null
    });
    await user.save();
    const result = user.toObject();
    delete result.password;
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

// PUT /api/admin/users/:id — Super Admin updates user credentials & details
router.put('/users/:id', verifyToken, checkRole('super_admin'), async (req, res, next) => {
  try {
    const { name, phone, email, password, role, department } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    if (phone && phone.trim() !== user.phone) {
      const existing = await User.findOne({ phone: phone.trim(), _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ message: 'Phone number already in use by another user.' });
      user.phone = phone.trim();
    }

    if (email && email.trim() !== user.email) {
      const existing = await User.findOne({ email: email.trim(), _id: { $ne: user._id } });
      if (existing) return res.status(409).json({ message: 'Email address already in use by another user.' });
      user.email = email.trim();
    }

    if (name) user.name = name.trim();
    if (role) user.role = role;
    if (department !== undefined) user.department = department;

    if (password && password.trim().length > 0) {
      const bcrypt = require('bcryptjs');
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const result = user.toObject();
    delete result.password;
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/admin/users/:id — Super Admin deletes user
router.delete('/users/:id', verifyToken, checkRole('super_admin'), async (req, res, next) => {
  try {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: 'You cannot delete your own Super Admin account.' });
    }
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully.', userId: req.params.id });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// GET /api/admin/heatmap — Geo-weighted complaint points
// ───────────────────────────────────────────────
router.get('/heatmap', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const query = req.user.role === 'dept_admin' ? { assignedDept: req.user.department } : {};
    const actives = await Complaint.find(query).select('location priority issueType status description createdAt');
    const points = actives
      .filter(c => c.location?.coordinates && Array.isArray(c.location.coordinates) && c.location.coordinates.length >= 2)
      .map(c => ({
        id: c._id,
        lat: Number(c.location.coordinates[1]),
        lng: Number(c.location.coordinates[0]),
        weight: c.priority === 'Critical' ? 3 : c.priority === 'High' ? 2 : 1,
        priority: c.priority,
        issueType: c.issueType,
        status: c.status,
        address: c.location?.address || 'Navi Mumbai',
        description: c.description
      }));
    res.json(points);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
