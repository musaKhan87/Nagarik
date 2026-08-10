const express = require('express');
const router = express.Router();
const { classifyFromText } = require('../services/aiClassifier');

// POST /api/classify
// Accepts { description } and returns AI classification metadata
router.post('/', (req, res) => {
  const { description } = req.body;
  if (!description) {
    return res.status(400).json({ message: 'Please provide a description to classify.' });
  }
  const result = classifyFromText(description);
  res.json(result);
});

module.exports = router;
