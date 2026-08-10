const cron = require('node-cron');
const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { sendSLABreachEmail } = require('./emailService');
const { sendPushNotificationToUser } = require('./pushService');

/**
 * SLA Monitor — checks every 10 minutes (or hourly)
 * Flags complaints as SLA-breached if their deadline has passed
 * and sends urgent Web Push & Email alerts to department admins.
 */
const startSLAMonitor = () => {
  // Check every 10 minutes for fast breach detection
  cron.schedule('*/10 * * * *', async () => {
    console.log('[SLA MONITOR] Running SLA compliance check...');
    try {
      const now = new Date();

      // Find all non-resolved, non-closed, non-already-flagged complaints past their deadline
      const breached = await Complaint.find({
        status: { $nin: ['Resolved', 'Closed'] },
        isSLABreached: false,
        deadline: { $lt: now },
      });

      for (const complaint of breached) {
        complaint.isSLABreached = true;
        await complaint.save();

        // Find department admins for this department & super admins
        const admins = await User.find({
          $or: [
            { role: 'dept_admin', department: complaint.assignedDept },
            { role: 'super_admin' }
          ]
        });

        for (const admin of admins) {
          // Send Email Alert
          if (admin.email) {
            await sendSLABreachEmail({
              adminEmail: admin.email,
              complaintId: complaint._id,
              issueType: complaint.issueType,
              department: complaint.assignedDept,
              deadline: complaint.deadline,
            });
          }

          // Send Urgent Web Push Notification to Admin
          await sendPushNotificationToUser(admin._id, {
            title: `🚨 URGENT: SLA Breached (#${complaint._id.toString().slice(-6)})`,
            body: `Complaint (${complaint.issueType}) assigned to ${complaint.assignedDept} has exceeded its SLA deadline!`,
            icon: '/icon-192.png',
            data: {
              url: `/admin/complaints`,
              complaintId: complaint._id.toString(),
              breached: true
            }
          });
        }

        console.log(`[SLA MONITOR] 🚨 SLA Breach Flagged: #${complaint._id} (${complaint.issueType} - ${complaint.assignedDept})`);
      }

      if (breached.length > 0) {
        console.log(`[SLA MONITOR] Flagged & alerted on ${breached.length} SLA breach(es).`);
      }
    } catch (err) {
      console.error('[SLA MONITOR] Error during SLA check:', err.message);
    }
  });

  console.log('[SLA MONITOR] Scheduled: SLA compliance & breach alert monitor active.');
};

module.exports = { startSLAMonitor };
