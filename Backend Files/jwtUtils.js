/**
 * JWT Utility Functions
 * Token generation and verification helpers
 */

const jwt = require('jsonwebtoken');

/**
 * Generate access token (short-lived)
 */
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

/**
 * Generate refresh token (long-lived)
 */
const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

/**
 * Generate token pair and send response
 */
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  const userData = user.toObject ? user.toObject() : user;
  delete userData.password;
  delete userData.refreshToken;

  res.status(statusCode).json({
    success: true,
    message,
    accessToken,
    refreshToken,
    user: userData,
  });
};

module.exports = { generateAccessToken, generateRefreshToken, verifyRefreshToken, sendTokenResponse };
