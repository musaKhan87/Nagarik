const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { verifyToken } = require('../middleware/authMiddleware');
const { getVapidPublicKey } = require('../services/pushService');

// GET /api/notifications/vapid-public-key
router.get('/vapid-public-key', (req, res) => {
  const publicKey = getVapidPublicKey();
  res.json({ publicKey });
});

// POST /api/notifications/subscribe
router.post('/subscribe', verifyToken, async (req, res, next) => {
  try {
    const { subscription } = req.body;

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return res.status(400).json({ message: 'Invalid push subscription object provided.' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found.' });

    // Check if subscription already exists for this endpoint
    const existingIndex = user.pushSubscriptions.findIndex(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (existingIndex >= 0) {
      // Update keys & timestamp if endpoint exists
      user.pushSubscriptions[existingIndex] = {
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        subscribedAt: new Date()
      };
    } else {
      // Add new subscription
      user.pushSubscriptions.push({
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        subscribedAt: new Date()
      });
    }

    await user.save();
    res.status(200).json({ success: true, message: 'Web Push subscription registered successfully.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/unsubscribe
router.post('/unsubscribe', verifyToken, async (req, res, next) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({ message: 'Endpoint is required for unsubscription.' });
    }

    await User.findByIdAndUpdate(req.user.userId, {
      $pull: { pushSubscriptions: { endpoint } }
    });

    res.status(200).json({ success: true, message: 'Unsubscribed successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
