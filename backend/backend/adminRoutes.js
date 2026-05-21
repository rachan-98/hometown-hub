const express = require('express');
const router = express.Router();
const { getDashboardStats, toggleUserBan, changeUserRole, getReportedPosts, removePost, toggleCommunityBan } = require('../controllers/adminController');
const { protect, requireAdmin, requireModerator } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', requireAdmin, getDashboardStats);
router.get('/reports', requireModerator, getReportedPosts);
router.put('/users/:userId/ban', requireAdmin, toggleUserBan);
router.put('/users/:userId/role', requireAdmin, changeUserRole);
router.delete('/posts/:postId', requireModerator, removePost);
router.put('/communities/:communityId/ban', requireAdmin, toggleCommunityBan);

module.exports = router;
