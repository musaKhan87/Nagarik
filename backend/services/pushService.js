const webpush = require('web-push');
const User = require('../models/User');

// Load VAPID Keys from environment variables or generate default keypair
let vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
let vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
let vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@smartcity.gov';

if (!vapidPublicKey || !vapidPrivateKey) {
  // Generate valid VAPID keys for immediate out-of-the-box Web Push support
  const generatedKeys = webpush.generateVapidKeys();
  vapidPublicKey = generatedKeys.publicKey;
  vapidPrivateKey = generatedKeys.privateKey;
  console.log('🔑 Auto-generated VAPID Public Key:', vapidPublicKey);
}

try {
  webpush.setVapidDetails(
    vapidSubject,
    vapidPublicKey,
    vapidPrivateKey
  );
} catch (err) {
  console.error('Failed to initialize web-push VAPID details:', err);
}

/**
 * Returns the VAPID Public Key for client subscription
 */
function getVapidPublicKey() {
  return vapidPublicKey;
}

/**
 * Sends Web Push Notification to a user's registered devices.
 * Automatically handles expired/invalid subscriptions (410/404).
 */
async function sendPushNotificationToUser(userId, notificationPayload) {
  if (!userId) return { success: false, message: 'No userId provided' };

  try {
    const user = await User.findById(userId);
    if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
      return { success: false, message: 'User has no active push subscriptions' };
    }

    const payloadString = JSON.stringify(notificationPayload);
    const expiredEndpoints = [];

    const sendPromises = user.pushSubscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: sub.keys
        }, payloadString);
      } catch (err) {
        // 410 Gone or 404 Not Found indicates subscription has expired or was revoked
        if (err.statusCode === 410 || err.statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        } else {
          console.error(`Error sending push notification to endpoint ${sub.endpoint}:`, err.message);
        }
      }
    });

    await Promise.all(sendPromises);

    // Prune expired or revoked subscriptions from database
    if (expiredEndpoints.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: { pushSubscriptions: { endpoint: { $in: expiredEndpoints } } }
      });
      console.log(`🧹 Pruned ${expiredEndpoints.length} expired push subscription(s) for user ${userId}`);
    }

    return { success: true };
  } catch (error) {
    console.error('sendPushNotificationToUser failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Status message mapping for user notifications
 */
function getStatusMessage(issueType, prevStatus, newStatus) {
  const statusMessages = {
    'Submitted': `Your ${issueType} complaint has been submitted and logged on the city grid.`,
    'Under Review': `Department admins are reviewing your ${issueType} complaint.`,
    'In Progress': `A field worker has been assigned and is working on your ${issueType} complaint.`,
    'Resolved': `Great news! Your ${issueType} complaint has been resolved. Tap to view proof photo & rate service!`,
    'Rejected': `Your ${issueType} complaint could not be processed. Tap to review details.`,
    'Closed': `Your ${issueType} complaint ticket has been closed.`,
    'Pending': `Your ${issueType} complaint is queued for assignment.`
  };

  return statusMessages[newStatus] || `Complaint status updated to ${newStatus}.`;
}

module.exports = {
  getVapidPublicKey,
  sendPushNotificationToUser,
  getStatusMessage
};
