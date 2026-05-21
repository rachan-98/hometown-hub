/**
 * User Controller
 * Profile management, follow system, user listing
 */

const User = require('../models/User');
const Post = require('../models/Post');
const { createNotification, notificationTemplates } = require('../utils/notificationUtils');

/**
 * @desc    Get user profile by username
 * @route   GET /api/users/:username
 * @access  Public
 */
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('communities', 'name slug avatar memberCount category')
      .select('-password -refreshToken -email -notificationPreferences');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get post count
    const postCount = await Post.countDocuments({ author: user._id, isDeleted: false });

    res.json({
      success: true,
      user: {
        ...user.toObject(),
        postCount,
        followerCount: user.followers.length,
        followingCount: user.following.length,
        isFollowing: req.user ? user.followers.includes(req.user._id) : false,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update current user profile
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { displayName, bio, location, website, notificationPreferences } = req.body;

    const updateData = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (bio !== undefined) updateData.bio = bio;
    if (location !== undefined) updateData.location = location;
    if (website !== undefined) updateData.website = website;
    if (notificationPreferences) updateData.notificationPreferences = notificationPreferences;

    // Handle avatar upload from Cloudinary
    if (req.file) {
      updateData.avatar = req.file.path;
    }

    const user = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password -refreshToken');

    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Follow / Unfollow a user
 * @route   POST /api/users/:userId/follow
 * @access  Private
 */
const toggleFollow = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(userId, { $pull: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $pull: { following: userId } });

      res.json({ success: true, message: 'Unfollowed', isFollowing: false });
    } else {
      // Follow
      await User.findByIdAndUpdate(userId, { $addToSet: { followers: currentUserId } });
      await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: userId } });

      // Send notification
      const io = req.app.get('io');
      const template = notificationTemplates.new_follower(req.user.displayName || req.user.username);
      await createNotification(io, {
        recipient: userId,
        sender: currentUserId,
        type: 'new_follower',
        ...template,
        reference: { type: 'user', id: currentUserId },
      });

      res.json({ success: true, message: 'Following', isFollowing: true });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's posts
 * @route   GET /api/users/:username/posts
 * @access  Public
 */
const getUserPosts = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ author: user._id, isDeleted: false })
      .populate('author', 'username displayName avatar')
      .populate('community', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments({ author: user._id, isDeleted: false });

    res.json({
      success: true,
      posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get followers / following list
 * @route   GET /api/users/:username/followers
 * @route   GET /api/users/:username/following
 * @access  Public
 */
const getFollowers = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'username displayName avatar bio')
      .select('followers');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, users: user.followers });
  } catch (error) {
    next(error);
  }
};

const getFollowing = async (req, res, next) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('following', 'username displayName avatar bio')
      .select('following');

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    res.json({ success: true, users: user.following });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (admin)
 * @route   GET /api/users
 * @access  Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';

    const query = search
      ? { $or: [{ username: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] }
      : {};

    const users = await User.find(query)
      .select('-password -refreshToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserProfile, updateProfile, toggleFollow, getUserPosts, getFollowers, getFollowing, getAllUsers };
