const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { uploadPostImage, uploadAvatar, uploadCommunityImage } = require('../config/cloudinary');

// Generic upload endpoint
router.post('/image', protect, uploadPostImage.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.json({
    success: true,
    url: req.file.path,
    publicId: req.file.filename,
  });
});

module.exports = router;
