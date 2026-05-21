/**
 * Validation Middleware
 * Express-validator rules for all routes
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * Handle validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ===========================
// AUTH VALIDATORS
// ===========================
const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be 3-30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain uppercase, lowercase, and a number'),
  validate,
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  validate,
];

// ===========================
// POST VALIDATORS
// ===========================
const createPostValidator = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content must be 1-10000 characters'),
  body('community').isMongoId().withMessage('Valid community ID is required'),
  body('title').optional().isLength({ max: 300 }).withMessage('Title cannot exceed 300 characters'),
  validate,
];

const createCommentValidator = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be 1-1000 characters'),
  validate,
];

// ===========================
// COMMUNITY VALIDATORS
// ===========================
const createCommunityValidator = [
  body('name')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Name must be 3-50 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Description must be 10-1000 characters'),
  body('category').isIn([
    'neighborhood', 'marketplace', 'events', 'sports', 'food',
    'arts', 'technology', 'education', 'health', 'environment', 'politics', 'general',
  ]).withMessage('Invalid category'),
  validate,
];

// ===========================
// EVENT VALIDATORS
// ===========================
const createEventValidator = [
  body('title').trim().isLength({ min: 3, max: 200 }).withMessage('Title must be 3-200 characters'),
  body('description').trim().isLength({ min: 10, max: 5000 }).withMessage('Description must be 10-5000 characters'),
  body('community').isMongoId().withMessage('Valid community ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  validate,
];

// ===========================
// PROFILE VALIDATORS
// ===========================
const updateProfileValidator = [
  body('displayName').optional().isLength({ max: 60 }).withMessage('Display name cannot exceed 60 characters'),
  body('bio').optional().isLength({ max: 500 }).withMessage('Bio cannot exceed 500 characters'),
  body('location').optional().isLength({ max: 100 }).withMessage('Location cannot exceed 100 characters'),
  body('website').optional().isURL().withMessage('Invalid URL format'),
  validate,
];

// ===========================
// PAGINATION VALIDATOR
// ===========================
const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
  validate,
];

module.exports = {
  validate,
  registerValidator,
  loginValidator,
  createPostValidator,
  createCommentValidator,
  createCommunityValidator,
  createEventValidator,
  updateProfileValidator,
  paginationValidator,
};
