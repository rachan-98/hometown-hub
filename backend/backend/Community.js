/**
 * Community Model
 * Represents a neighborhood/topic community
 */

const mongoose = require('mongoose');

const communitySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Community name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Name must be at least 3 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      required: true,
      enum: [
        'neighborhood',
        'marketplace',
        'events',
        'sports',
        'food',
        'arts',
        'technology',
        'education',
        'health',
        'environment',
        'politics',
        'general',
      ],
      default: 'general',
    },
    avatar: {
      type: String,
      default: '',
    },
    banner: {
      type: String,
      default: '',
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    moderators: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        role: { type: String, enum: ['member', 'moderator', 'admin'], default: 'member' },
        joinedAt: { type: Date, default: Date.now },
      },
    ],
    memberCount: {
      type: Number,
      default: 1,
    },
    postCount: {
      type: Number,
      default: 0,
    },
    rules: [
      {
        title: { type: String, required: true },
        description: { type: String },
      },
    ],
    tags: [{ type: String, trim: true }],
    location: {
      city: String,
      state: String,
      country: String,
    },
    isPrivate: {
      type: Boolean,
      default: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: '',
    },
    settings: {
      allowPosts: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      allowImages: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create slug from name before saving
communitySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Indexes
communitySchema.index({ name: 'text', description: 'text', tags: 'text' });
communitySchema.index({ slug: 1 });
communitySchema.index({ category: 1 });
communitySchema.index({ memberCount: -1 });
communitySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Community', communitySchema);
