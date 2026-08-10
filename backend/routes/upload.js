const express = require('express');
const router = express.Router();
const { upload, uploadToCloudinary } = require('../middleware/uploadMiddleware');

// POST /api/upload/image
// Accepts a multipart/form-data photo field, uploads to Cloudinary, returns secure URL
router.post('/image', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const url = await uploadToCloudinary(req.file.buffer, 'smart_city/complaints');
    res.json({ url });
  } catch (err) {
    res.status(500).json({ message: 'Image upload failed. Please try again.' });
  }
});

module.exports = router;
