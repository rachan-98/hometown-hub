// postRoutes.js
const express = require('express');
const postRouter = express.Router();
const { createPost, getPost, updatePost, deletePost, toggleLike, addComment, deleteComment, reportPost } = require('../controllers/postController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { createPostValidator, createCommentValidator } = require('../middleware/validationMiddleware');
const { uploadPostImage } = require('../config/cloudinary');

postRouter.post('/', protect, uploadPostImage.array('images', 4), createPostValidator, createPost);
postRouter.get('/:id', optionalAuth, getPost);
postRouter.put('/:id', protect, updatePost);
postRouter.delete('/:id', protect, deletePost);
postRouter.post('/:id/like', protect, toggleLike);
postRouter.post('/:id/comments', protect, createCommentValidator, addComment);
postRouter.delete('/:id/comments/:commentId', protect, deleteComment);
postRouter.post('/:id/report', protect, reportPost);

module.exports = postRouter;
