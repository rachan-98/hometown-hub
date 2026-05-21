/**
 * Authentication Middleware
 * JWT token verification and user protection
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Protect routes - requires valid JWT
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header or cookie
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password -refreshToken');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token is invalid. User not found.',
      });
    }

    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        message: `Account suspended. Reason: ${user.banReason || 'Policy violation'}`,
      });
    }

    // Update last active
    user.lastActive = new Date();
    await user.save({ validateBeforeSave: false });

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token expired.' });
    }
    next(error);
  }
};

/**
 * Optional auth - attaches user if token exists but doesn't block
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -refreshToken');
      if (user && !user.isBanned) {
        req.user = user;
      }
    }
    next();
  } catch {
    next(); // Continue even if token is invalid
  }
};

/**
 * Require specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${roles.join(' or ')}`,
      });
    }
    next();
  };
};

/**
 * Require admin role
 */
const requireAdmin = requireRole('admin');

/**
 * Require moderator or admin role
 */
const requireModerator = requireRole('moderator', 'admin');

module.exports = { protect, optionalAuth, requireRole, requireAdmin, requireModerator };
