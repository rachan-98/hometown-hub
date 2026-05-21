// userRoutes.js
const express = require('express');
const router = express.Router();
const { getUserProfile, updateProfile, toggleFollow, getUserPosts, getFollowers, getFollowing, getAllUsers } = require('../controllers/userController');
const { protect, optionalAuth, requireAdmin } = require('../middleware/authMiddleware');
const { updateProfileValidator } = require('../middleware/validationMiddleware');
const { uploadAvatar } = require('../config/cloudinary');

router.get('/', protect, requireAdmin, getAllUsers);
router.get('/:username', optionalAuth, getUserProfile);
router.put('/profile', protect, uploadAvatar.single('avatar'), updateProfileValidator, updateProfile);
router.post('/:userId/follow', protect, toggleFollow);
router.get('/:username/posts', optionalAuth, getUserPosts);
router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);

module.exports = router;
