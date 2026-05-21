/**
 * Post Model
 * Community posts with likes, comments, images
 */

const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
      trim: true,
    },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    content: {
      type: String,
      required: [true, 'Post content is required'],
      maxlength: [10000, 'Content cannot exceed 10000 characters'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'link', 'event', 'poll'],
      default: 'text',
    },
    images: [
      {
        url: String,
        publicId: String,
        caption: String,
      },
    ],
    link: {
      url: String,
      title: String,
      description: String,
      image: String,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    tags: [{ type: String, trim: true }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    likeCount: {
      type: Number,
      default: 0,
    },
    comments: [commentSchema],
    commentCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isApproved: {
      type: Boolean,
      default: true,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Full text search index
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ community: 1, createdAt: -1 });
postSchema.index({ author: 1, createdAt: -1 });
postSchema.index({ likeCount: -1 });
postSchema.index({ isDeleted: 1 });

module.exports = mongoose.model('Post', postSchema);
