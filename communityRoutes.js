const express = require('express');
const router = express.Router();
const {
  createCommunity, getCommunities, getCommunity, toggleMembership,
  updateCommunity, getCommunityPosts, getFeed
} = require('../controllers/communityController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { createCommunityValidator } = require('../middleware/validationMiddleware');
const { uploadCommunityImage } = require('../config/cloudinary');

router.get('/feed', protect, getFeed);
router.get('/', getCommunities);
router.post('/', protect, uploadCommunityImage.single('avatar'), createCommunityValidator, createCommunity);
router.get('/:slug', optionalAuth, getCommunity);
router.put('/:id', protect, uploadCommunityImage.single('avatar'), updateCommunity);
router.post('/:id/join', protect, toggleMembership);
router.get('/:slug/posts', optionalAuth, getCommunityPosts);

module.exports = router;
