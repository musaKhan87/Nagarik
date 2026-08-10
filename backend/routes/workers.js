const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { sendStatusEmail } = require('../services/emailService');
const { sendPushNotificationToUser, getStatusMessage } = require('../services/pushService');

// ───────────────────────────────────────────────
// GET /api/worker/assigned — Worker's task list
// ───────────────────────────────────────────────
router.get('/assigned', verifyToken, checkRole('worker'), async (req, res, next) => {
  try {
    const tasks = await Complaint.find({ assignedWorker: req.user.userId }).sort({ deadline: 1 });
    res.json(tasks);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// PUT /api/worker/:id/resolve — Mark complaint resolved
// ───────────────────────────────────────────────
router.put('/:id/resolve', verifyToken, checkRole('worker'), async (req, res, next) => {
  try {
    const { resolvedPhoto } = req.body;
    if (!resolvedPhoto) {
      return res.status(400).json({ message: 'Please upload a resolution proof photo URL.' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found.' });

    if (!complaint.assignedWorker || complaint.assignedWorker.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to resolve this complaint.' });
    }

    const prevStatus = complaint.status;
    const newStatus = 'Resolved';

    complaint.status = newStatus;
    complaint.resolvedPhoto = resolvedPhoto;
    await complaint.save();

    // Trigger Web Push notification if status changed
    if (prevStatus !== newStatus) {
      sendPushNotificationToUser(complaint.citizenId, {
        title: `Complaint Resolved: #${complaint._id.toString().slice(-6)}`,
        body: getStatusMessage(complaint.issueType, prevStatus, newStatus),
        icon: '/icon-192.png',
        data: {
          url: `/track?id=${complaint._id}`,
          complaintId: complaint._id.toString(),
          prevStatus,
          newStatus
        }
      });
    }

    // Notify citizen of resolution via Email
    const citizen = await User.findById(complaint.citizenId);
    if (citizen?.email) {
      await sendStatusEmail({
        to: citizen.email,
        name: citizen.name,
        complaintId: complaint._id,
        status: 'Resolved',
        issueType: complaint.issueType,
        deadline: null,
      });
    }

    res.json(complaint);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
