const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { sendStatusEmail } = require('../services/emailService');
const { sendPushNotificationToUser, getStatusMessage } = require('../services/pushService');
const { calculatePriorityScore } = require('../services/priorityEngine');

const DEFAULT_DEPARTMENTS = {
  // Roads & Infrastructure Dept
  'Broken Road': 'Roads & Infrastructure Dept',
  'Potholes & Roads': 'Roads & Infrastructure Dept',
  'Pothole': 'Roads & Infrastructure Dept',
  'Footpaths & Signals': 'Roads & Infrastructure Dept',
  'Traffic & Parking': 'Roads & Infrastructure Dept',

  // Sanitation Dept
  'Garbage': 'Sanitation Dept',
  'Garbage & Waste': 'Sanitation Dept',
  'Waterlogging': 'Sanitation Dept',
  'Illegal Dumping': 'Sanitation Dept',
  'Sewage': 'Sanitation Dept',
  'Sanitation & Drains': 'Sanitation Dept',

  // Electricity Dept
  'Street Light': 'Electricity Dept',
  'Streetlights': 'Electricity Dept',
  'Broken Streetlight': 'Electricity Dept',

  // Water Supply Dept
  'Water Leakage': 'Water Supply Dept',
  'Water Supply': 'Water Supply Dept',

  // General & Parks Dept
  'Parks & Trees': 'General Dept',
  'Other': 'General Dept',
};

// ───────────────────────────────────────────────
// POST /api/complaints — Submit a new complaint
// ───────────────────────────────────────────────
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const { issueType, description, photo, lat, lng, address, priority, bypassDuplicate } = req.body;

    if (!issueType || !description || !photo || lat === undefined || lng === undefined) {
      return res.status(400).json({
        message: 'Please fill in all required fields: issueType, description, photo, lat, lng',
      });
    }

    // ── 1. DUPLICATE DETECTION ENGINE ─────────────────────
    // Detect similar unresolved complaints within 100m in the last 24 hours (if not bypassed by citizen)
    let duplicate = null;
    if (!bypassDuplicate) {
      try {
        duplicate = await Complaint.findOne({
          issueType,
          status: { $nin: ['Resolved', 'Closed'] },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
              $maxDistance: 100, // 100 metres radius
            },
          },
        });
      } catch (geoErr) {
        // Fallback if 2dsphere index is still building on MongoDB Atlas
        console.warn('[GEO INDEX FALLBACK] Using Haversine distance calculation:', geoErr.message);
        const recentCandidates = await Complaint.find({
          issueType,
          status: { $nin: ['Resolved', 'Closed'] },
          createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        });

        const haversineMeters = (lat1, lon1, lat2, lon2) => {
          const R = 6371e3; // Earth radius in metres
          const φ1 = lat1 * Math.PI / 180;
          const φ2 = lat2 * Math.PI / 180;
          const Δφ = (lat2 - lat1) * Math.PI / 180;
          const Δλ = (lon2 - lon1) * Math.PI / 180;
          const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                    Math.cos(φ1) * Math.cos(φ2) *
                    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        duplicate = recentCandidates.find(c => {
          if (c.location?.coordinates && c.location.coordinates.length === 2) {
            const dist = haversineMeters(parseFloat(lat), parseFloat(lng), c.location.coordinates[1], c.location.coordinates[0]);
            return dist <= 100;
          }
          return false;
        }) || null;
      }

      if (duplicate) {
        return res.status(200).json({
          isDuplicate: true,
          complaint: duplicate,
          message: `A similar active ${issueType} complaint exists within 100m. Please review it to upvote or proceed with a new complaint.`,
        });
      }
    }

    // ── 2. PRIORITY SCORE ENGINE ───────────────────────────────────────
    // Calculate Priority (Critical, High, Medium, Low) & SLA hours based on issueType + description NLP keywords
    const computedPriorityResult = calculatePriorityScore(issueType, description);
    const finalPriority = priority || computedPriorityResult.priority;
    const slaHours = computedPriorityResult.slaHours;

    const assignedDept = DEFAULT_DEPARTMENTS[issueType] || 'General Dept';
    const deadlineDate = new Date();
    deadlineDate.setHours(deadlineDate.getHours() + slaHours);

    const complaint = new Complaint({
      citizenId: req.user.userId,
      issueType,
      description,
      photo,
      location: {
        type: 'Point',
        coordinates: [parseFloat(lng), parseFloat(lat)],
        address: address || 'Smart City Captured Location',
      },
      priority: finalPriority,
      status: 'Submitted',
      assignedDept,
      deadline: deadlineDate,
    });

    await complaint.save();

    // Email the citizen acknowledgement (Asynchronously in background to avoid blocking API response)
    User.findById(req.user.userId).then(citizen => {
      if (citizen?.email) {
        sendStatusEmail({
          to: citizen.email,
          name: citizen.name,
          complaintId: complaint._id,
          status: 'Submitted',
          issueType: complaint.issueType,
          deadline: complaint.deadline,
        }).catch(e => console.error('[EMAIL BACKGROUND ERR]:', e.message));
      }
    }).catch(e => console.error('[EMAIL USER LOOKUP ERR]:', e.message));

    // Trigger Web Push Notification for Complaint Submitted
    sendPushNotificationToUser(req.user.userId, {
      title: `Complaint Submitted: #${complaint._id.toString().slice(-6)}`,
      body: getStatusMessage(complaint.issueType, null, 'Submitted'),
      icon: '/icon-192.png',
      data: {
        url: `/track?id=${complaint._id}`,
        complaintId: complaint._id.toString(),
        prevStatus: null,
        newStatus: 'Submitted'
      }
    });

    res.status(201).json({
      complaintId: complaint._id,
      trackingId: complaint._id,
      priority: finalPriority,
      slaHours,
      assignedDept
    });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// GET /api/complaints/mine — Citizen's own list
// ───────────────────────────────────────────────
router.get('/mine', verifyToken, async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user.userId }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// GET /api/complaints/:id — Complaint detail
// ───────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: 'No complaint found with this tracking ID.' });
    }
    // Citizens can only see their own complaints
    if (req.user.role === 'citizen' && complaint.citizenId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'You do not have permission to view this complaint.' });
    }
    res.json(complaint);
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// PUT /api/complaints/:id/upvote — Upvote a complaint
// ───────────────────────────────────────────────
router.put('/:id/upvote', verifyToken, async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'No complaint found.' });

    const alreadyUpvoted = complaint.upvotes.some(u => u.userId.toString() === req.user.userId);
    if (alreadyUpvoted) {
      return res.status(400).json({ message: 'You have already upvoted this complaint.' });
    }

    complaint.upvotes.push({ userId: req.user.userId });
    complaint.upvoteCount = complaint.upvotes.length;

    // Escalate priority if >= 10 upvotes
    if (complaint.upvoteCount >= 10 && complaint.priority !== 'Critical') {
      complaint.priority = 'Critical';
      const newDeadline = new Date();
      newDeadline.setHours(newDeadline.getHours() + SLA_HOURS['Critical']);
      complaint.deadline = newDeadline;
    }

    await complaint.save();
    res.json({ upvoteCount: complaint.upvoteCount });
  } catch (err) {
    next(err);
  }
});

// ───────────────────────────────────────────────
// POST /api/complaints/:id/feedback — Submit feedback
// ───────────────────────────────────────────────
router.post('/:id/feedback', verifyToken, async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    if (!rating) {
      return res.status(400).json({ message: 'Please provide a rating (1–5).' });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'No complaint found.' });

    if (complaint.status !== 'Resolved') {
      return res.status(400).json({ message: 'Feedback can only be submitted after the complaint is resolved.' });
    }

    // Ensure only the original citizen can rate
    if (complaint.citizenId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the original reporter can submit feedback.' });
    }

    complaint.feedback = { rating, comment, submittedAt: new Date() };
    await complaint.save();
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
