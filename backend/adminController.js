/**
 * Admin Controller
 * Platform moderation, analytics, user/content management
 */

const User = require('../models/User');
const Post = require('../models/Post');
const Community = require('../models/Community');
const Event = require('../models/Event');

/**
 * @desc    Get admin dashboard stats
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [totalUsers, totalPosts, totalCommunities, totalEvents, bannedUsers, reportedPosts, newUsersToday, activeUsers] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments({ isDeleted: false }),
      Community.countDocuments({ isBanned: false }),
      Event.countDocuments({ isDeleted: false }),
      User.countDocuments({ isBanned: true }),
      Post.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false }),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      User.countDocuments({ lastActive: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    // Growth data (last 7 days)
    const growthData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [users, posts] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
        Post.countDocuments({ createdAt: { $gte: startOfDay, $lte: endOfDay } }),
      ]);

      growthData.push({
        date: startOfDay.toISOString().split('T')[0],
        users,
        posts,
      });
    }

    res.json({
      success: true,
      stats: {
        totalUsers, totalPosts, totalCommunities, totalEvents,
        bannedUsers, reportedPosts, newUsersToday, activeUsers,
      },
      growthData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ban / Unban user
 * @route   PUT /api/admin/users/:userId/ban
 * @access  Admin
 */
const toggleUserBan = async (req, res, next) => {
  try {
    const { ban, reason } = req.body;
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot ban another admin' });
    }

    user.isBanned = ban;
    user.banReason = ban ? (reason || 'Policy violation') : '';
    await user.save({ validateBeforeSave: false });

    res.json({
      success: true,
      message: ban ? `User ${user.username} banned` : `User ${user.username} unbanned`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change user role
 * @route   PUT /api/admin/users/:userId/role
 * @access  Admin
 */
const changeUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role },
      { new: true }
    ).select('-password -refreshToken');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, message: `Role updated to ${role}`, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get reported posts
 * @route   GET /api/admin/reports
 * @access  Admin / Moderator
 */
const getReportedPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ reportCount: { $gt: 0 }, isDeleted: false })
      .populate('author', 'username displayName avatar')
      .populate('community', 'name slug')
      .sort({ reportCount: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ reportCount: { $gt: 0 }, isDeleted: false });

    res.json({ success: true, posts, pagination: { page, limit, total } });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove reported post
 * @route   DELETE /api/admin/posts/:postId
 * @access  Admin / Moderator
 */
const removePost = async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { isDeleted: true, deletedBy: req.user._id },
      { new: true }
    );

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    await Community.findByIdAndUpdate(post.community, { $inc: { postCount: -1 } });

    res.json({ success: true, message: 'Post removed' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Ban / Unban community
 * @route   PUT /api/admin/communities/:communityId/ban
 * @access  Admin
 */
const toggleCommunityBan = async (req, res, next) => {
  try {
    const { ban, reason } = req.body;
    const community = await Community.findByIdAndUpdate(
      req.params.communityId,
      { isBanned: ban, banReason: ban ? reason : '' },
      { new: true }
    );

    if (!community) return res.status(404).json({ success: false, message: 'Community not found' });

    res.json({
      success: true,
      message: ban ? 'Community banned' : 'Community unbanned',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardStats, toggleUserBan, changeUserRole, getReportedPosts, removePost, toggleCommunityBan };
