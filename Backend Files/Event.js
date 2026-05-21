/**
 * Event Model
 * Community events with RSVP system
 */

const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    category: {
      type: String,
      enum: ['social', 'sports', 'music', 'food', 'arts', 'education', 'business', 'health', 'other'],
      default: 'social',
    },
    image: {
      type: String,
      default: '',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    community: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
    },
    isAllDay: {
      type: Boolean,
      default: false,
    },
    location: {
      address: String,
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      isOnline: { type: Boolean, default: false },
      onlineUrl: String,
    },
    capacity: {
      type: Number,
      default: 0, // 0 = unlimited
    },
    price: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: 'USD',
    },
    isFree: {
      type: Boolean,
      default: true,
    },
    attendees: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['going', 'maybe', 'not_going'], default: 'going' },
        rsvpAt: { type: Date, default: Date.now },
      },
    ],
    attendeeCount: {
      type: Number,
      default: 0,
    },
    tags: [{ type: String, trim: true }],
    isPublished: {
      type: Boolean,
      default: true,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },
    cancelReason: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ community: 1, startDate: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ startDate: 1 });
eventSchema.index({ isDeleted: 1, isCancelled: 1 });

module.exports = mongoose.model('Event', eventSchema);
