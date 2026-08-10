const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send status update email to citizen
 */
const sendStatusEmail = async ({ to, name, complaintId, status, issueType, deadline }) => {
  if (!to) return; // skip if citizen has no email

  const statusColor = {
    Pending: '#F59E0B',
    'In Progress': '#3B82F6',
    Resolved: '#10B981',
  }[status] || '#64748B';

  const mailOptions = {
    from: `"CivicLink Notifications" <${process.env.EMAIL_USER}>`,
    to,
    subject: `[CivicLink] Your complaint ${complaintId} is now ${status}`,
    html: `
      <div style="font-family: 'DM Sans', sans-serif; background: #0B1120; color: #CBD5E1; padding: 32px; border-radius: 12px; max-width: 480px; margin: 0 auto;">
        <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px;">CivicLink</h1>
        <p style="color: #64748B; font-size: 12px; margin: 0 0 24px;">Smart City Grievance Portal</p>
        <div style="background: #111827; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <p style="margin: 0 0 4px; font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Status Update</p>
          <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 16px;">${issueType}</h2>
          <span style="background: ${statusColor}20; color: ${statusColor}; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px;">${status}</span>
        </div>
        <p style="margin: 0 0 8px;">Hello ${name},</p>
        <p style="margin: 0 0 24px; color: #94a3b8;">Your complaint <strong style="color: #F59E0B;">${complaintId}</strong> has been updated. Our municipal team ${status === 'In Progress' ? 'is actively working on it' : status === 'Resolved' ? 'has resolved this issue' : 'has received your report'}.</p>
        ${deadline ? `<p style="color: #64748B; font-size: 12px;">Expected resolution by: <strong style="color: #ffffff;">${new Date(deadline).toLocaleString()}</strong></p>` : ''}
        <hr style="border: none; border-top: 1px solid #1a2235; margin: 24px 0;" />
        <p style="color: #475569; font-size: 11px;">This is an automated notification from CivicLink. Do not reply to this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('[EMAIL] Failed to send status email:', err.message);
    // Non-fatal: log and continue
  }
};

/**
 * Send SLA breach alert email to admin
 */
const sendSLABreachEmail = async ({ adminEmail, complaintId, issueType, department, deadline }) => {
  if (!adminEmail) return;

  const mailOptions = {
    from: `"CivicLink SLA Monitor" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `⚠️ [CivicLink SLA BREACH] Complaint ${complaintId} overdue`,
    html: `
      <div style="font-family: sans-serif; background: #0B1120; color: #CBD5E1; padding: 32px; border-radius: 12px; max-width: 480px; margin: 0 auto;">
        <h1 style="color: #EF4444; margin: 0 0 16px;">⚠️ SLA Breach Detected</h1>
        <p>Complaint <strong style="color: #F59E0B;">${complaintId}</strong> in department <strong>${department}</strong> has exceeded its SLA deadline.</p>
        <p>Issue Type: <strong>${issueType}</strong></p>
        <p>Deadline was: <strong>${new Date(deadline).toLocaleString()}</strong></p>
        <p>Please assign or escalate this complaint immediately.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('[EMAIL] Failed to send SLA breach email:', err.message);
  }
};

module.exports = { sendStatusEmail, sendSLABreachEmail };
