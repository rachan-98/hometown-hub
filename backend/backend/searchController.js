/**
 * Search Controller
 * Global search across posts, communities, users, events
 */

const User = require('../models/User');
const Post = require('../models/Post');
const Community = require('../models/Community');
const Event = require('../models/Event');

/**
 * @desc    Global search
 * @route   GET /api/search?q=query&type=all|users|posts|communities|events
 * @access  Public
 */
const globalSearch = async (req, res, next) => {
  try {
    const { q, type = 'all' } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = { $regex: q.trim(), $options: 'i' };
    const limit = 5;

    const results = {};

    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [{ username: searchRegex }, { displayName: searchRegex }],
        isBanned: false,
      })
        .select('username displayName avatar bio')
        .limit(limit);
    }

    if (type === 'all' || type === 'communities') {
      results.communities = await Community.find({
        $or: [{ name: searchRegex }, { description: searchRegex }],
        isBanned: false,
      })
        .select('name slug description avatar memberCount category')
        .limit(limit);
    }

    if (type === 'all' || type === 'posts') {
      results.posts = await Post.find({
        $or: [{ title: searchRegex }, { content: searchRegex }],
        isDeleted: false,
        isApproved: true,
      })
        .populate('author', 'username displayName avatar')
        .populate('community', 'name slug')
        .select('title content author community likeCount commentCount createdAt')
        .limit(limit);
    }

    if (type === 'all' || type === 'events') {
      results.events = await Event.find({
        $or: [{ title: searchRegex }, { description: searchRegex }],
        isDeleted: false,
        isCancelled: false,
      })
        .populate('organizer', 'username displayName')
        .populate('community', 'name slug')
        .select('title description startDate location attendeeCount community organizer')
        .limit(limit);
    }

    const totalResults = Object.values(results).reduce((acc, arr) => acc + arr.length, 0);

    res.json({
      success: true,
      query: q,
      totalResults,
      results,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { globalSearch };
