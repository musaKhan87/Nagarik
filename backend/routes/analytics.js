const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

// GET /api/analytics/summary
// Returns counts by status, type, department, and SLA breach stats
router.get('/summary', verifyToken, checkRole('dept_admin', 'super_admin'), async (req, res) => {
  try {
    let matchStage = {};
    if (req.user.role === 'dept_admin') {
      matchStage.assignedDept = req.user.department;
    }

    const [byStatus, byType, byDept, slaSummary, dailyTrend] = await Promise.all([
      // Complaints by status
      Complaint.aggregate([
        { $match: matchStage },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      // Complaints by issue type
      Complaint.aggregate([
        { $match: matchStage },
        { $group: { _id: '$issueType', count: { $sum: 1 } } },
      ]),
      // Complaints by department
      Complaint.aggregate([
        { $group: { _id: '$assignedDept', count: { $sum: 1 } } },
      ]),
      // SLA breach count
      Complaint.aggregate([
        { $match: { ...matchStage, isSLABreached: true } },
        { $count: 'breached' },
      ]),
      // Daily trend: last 7 days
      Complaint.aggregate([
        { $match: { ...matchStage, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const totalComplaints = await Complaint.countDocuments(matchStage);
    const avgResolutionTime = await Complaint.aggregate([
      { $match: { ...matchStage, status: 'Resolved' } },
      {
        $project: {
          resolutionHours: {
            $divide: [{ $subtract: ['$updatedAt', '$createdAt'] }, 3600000],
          },
        },
      },
      { $group: { _id: null, avg: { $avg: '$resolutionHours' } } },
    ]);

    res.json({
      totalComplaints,
      byStatus: Object.fromEntries(byStatus.map(x => [x._id, x.count])),
      byType: Object.fromEntries(byType.map(x => [x._id, x.count])),
      byDept: Object.fromEntries(byDept.map(x => [x._id, x.count])),
      slaBreached: slaSummary[0]?.breached || 0,
      avgResolutionHours: Math.round(avgResolutionTime[0]?.avg || 0),
      dailyTrend,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to compute analytics summary.' });
  }
});

module.exports = router;
