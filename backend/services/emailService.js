const https = require('https');

/**
 * Brevo (formerly Sendinblue) Transactional Email Service via HTTP REST API
 * Uses standard HTTPS (Port 443) which works 100% reliably on Render, Vercel, and Cloud containers.
 */

const getBrevoApiKey = () => {
  return process.env.BREVO_API_KEY || process.env.EMAIL_PASSWORD || null;
};

const getSenderEmail = () => {
  return process.env.BREVO_SENDER_EMAIL || process.env.EMAIL_USER || 'notifications@nagarik-smartcity.com';
};

/**
 * Helper to dispatch email via Brevo REST API v3
 */
const sendBrevoEmail = async ({ toEmail, toName, subject, htmlContent }) => {
  const apiKey = getBrevoApiKey();
  if (!apiKey) {
    console.warn('[BREVO EMAIL] Skipping email dispatch: BREVO_API_KEY or EMAIL_PASSWORD environment variable not set.');
    return false;
  }

  const senderEmail = getSenderEmail();

  const payload = JSON.stringify({
    sender: {
      name: "Nagarik Smart City",
      email: senderEmail
    },
    to: [
      {
        email: toEmail,
        name: toName || toEmail
      }
    ],
    subject,
    htmlContent
  });

  const options = {
    hostname: 'api.brevo.com',
    port: 443,
    path: '/v3/smtp/email',
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'api-key': apiKey,
      'content-type': 'application/json',
      'content-length': Buffer.byteLength(payload)
    },
    timeout: 10000 // 10 second connection timeout
  };

  return new Promise((resolve) => {
    const req = https.request(options, (res) => {
      let responseBody = '';
      res.on('data', chunk => { responseBody += chunk; });
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[BREVO EMAIL] Successfully sent transactional email via HTTPS to ${toEmail} (Status ${res.statusCode})`);
          resolve(true);
        } else {
          console.error(`[BREVO EMAIL ERROR] Failed to send email (Status ${res.statusCode}):`, responseBody);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error('[BREVO EMAIL ERROR] HTTPS Request Error:', err.message);
      resolve(false);
    });

    req.on('timeout', () => {
      console.error('[BREVO EMAIL ERROR] HTTPS Request Timeout');
      req.destroy();
      resolve(false);
    });

    req.write(payload);
    req.end();
  });
};

/**
 * Send status update email to citizen via Brevo
 */
const sendStatusEmail = async ({ to, name, complaintId, status, issueType, deadline }) => {
  if (!to) return;

  const statusColor = {
    Pending: '#F59E0B',
    'In Progress': '#3B82F6',
    Resolved: '#10B981',
  }[status] || '#64748B';

  const htmlContent = `
    <div style="font-family: 'DM Sans', Arial, sans-serif; background: #0B1120; color: #CBD5E1; padding: 32px; border-radius: 12px; max-width: 480px; margin: 0 auto;">
      <h1 style="font-size: 24px; font-weight: 800; color: #ffffff; margin: 0 0 8px;">Nagarik</h1>
      <p style="color: #64748B; font-size: 12px; margin: 0 0 24px;">Smart City Grievance Portal</p>
      <div style="background: #111827; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 4px; font-size: 12px; color: #64748B; text-transform: uppercase; letter-spacing: 1px;">Status Update</p>
        <h2 style="color: #ffffff; font-size: 20px; margin: 0 0 16px;">${issueType}</h2>
        <span style="background: ${statusColor}20; color: ${statusColor}; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 999px;">${status}</span>
      </div>
      <p style="margin: 0 0 8px;">Hello ${name || 'Citizen'},</p>
      <p style="margin: 0 0 24px; color: #94a3b8;">Your complaint <strong style="color: #F59E0B;">#${complaintId}</strong> has been updated. Our municipal team ${status === 'In Progress' ? 'is actively working on it' : status === 'Resolved' ? 'has resolved this issue' : 'has received your report'}.</p>
      ${deadline ? `<p style="color: #64748B; font-size: 12px;">Expected resolution by: <strong style="color: #ffffff;">${new Date(deadline).toLocaleString()}</strong></p>` : ''}
      <hr style="border: none; border-top: 1px solid #1a2235; margin: 24px 0;" />
      <p style="color: #475569; font-size: 11px;">This is an automated notification from Nagarik. Powered by Brevo Transactional Email.</p>
    </div>
  `;

  await sendBrevoEmail({
    toEmail: to,
    toName: name,
    subject: `[Nagarik] Your complaint #${complaintId} is now ${status}`,
    htmlContent
  });
};

/**
 * Send SLA breach alert email to admin via Brevo
 */
const sendSLABreachEmail = async ({ adminEmail, complaintId, issueType, department, deadline }) => {
  if (!adminEmail) return;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; background: #0B1120; color: #CBD5E1; padding: 32px; border-radius: 12px; max-width: 480px; margin: 0 auto;">
      <h1 style="color: #EF4444; margin: 0 0 16px;">⚠️ SLA Breach Detected</h1>
      <p>Complaint <strong style="color: #F59E0B;">#${complaintId}</strong> in department <strong>${department}</strong> has exceeded its SLA deadline.</p>
      <p>Issue Type: <strong>${issueType}</strong></p>
      <p>Deadline was: <strong>${new Date(deadline).toLocaleString()}</strong></p>
      <p>Please assign or escalate this complaint immediately.</p>
    </div>
  `;

  await sendBrevoEmail({
    toEmail: adminEmail,
    toName: "Department Admin",
    subject: `⚠️ [Nagarik SLA BREACH] Complaint #${complaintId} overdue`,
    htmlContent
  });
};

module.exports = { sendStatusEmail, sendSLABreachEmail };
