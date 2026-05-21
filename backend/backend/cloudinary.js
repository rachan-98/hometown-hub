/**
 * Cloudinary Configuration
 * Handles image upload storage
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for profile avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hometown-hub/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
  },
});

// Storage for post images
const postStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hometown-hub/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [{ width: 1200, quality: 'auto', fetch_format: 'auto' }],
  },
});

// Storage for community banners
const communityStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'hometown-hub/communities',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1500, height: 500, crop: 'fill' }],
  },
});

// File size limits
const fileSizeLimit = 5 * 1024 * 1024; // 5MB

const uploadAvatar = multer({
  storage: avatarStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

const uploadPostImage = multer({
  storage: postStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

const uploadCommunityImage = multer({
  storage: communityStorage,
  limits: { fileSize: fileSizeLimit },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed'), false);
  },
});

module.exports = {
  cloudinary,
  uploadAvatar,
  uploadPostImage,
  uploadCommunityImage,
};
