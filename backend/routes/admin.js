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
    if (req.user.role === 'dept_admin' && req.user.department) {
      query.department = req.user.department;
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

    const worker = new User({
      name,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '')}@smartcity.gov`,
      password: hashedPassword,
      role: 'worker',
      department: department || req.user.department || 'Roads & Infrastructure Dept'
    });
    await worker.save();
    res.status(201).json(worker);
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
// ───────────────────────────────────────────────
router.get('/users', verifyToken, checkRole('super_admin'), async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
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

// ───────────────────────────────────────────────
// GET /api/admin/heatmap — Geo-weighted complaint points
// ───────────────────────────────────────────────
router.get('/heatmap', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res, next) => {
  try {
    const query = req.user.role === 'dept_admin' ? { assignedDept: req.user.department } : {};
    const actives = await Complaint.find(query).select('location priority');
    const points = actives.map(c => ({
      lat: c.location.coordinates[1],
      lng: c.location.coordinates[0],
      weight: c.priority === 'Critical' ? 3 : c.priority === 'High' ? 2 : 1,
    }));
    res.json(points);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
