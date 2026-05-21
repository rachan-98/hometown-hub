/**
 * Notification Model
 * Real-time notification system
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      required: true,
      enum: [
        'post_like',        // Someone liked your post
        'post_comment',     // Someone commented on your post
        'comment_like',     // Someone liked your comment
        'new_follower',     // Someone followed you
        'community_invite', // Invited to join a community
        'community_join',   // Someone joined your community
        'event_rsvp',       // Someone RSVPed to your event
        'event_reminder',   // Event starting soon
        'post_approved',    // Post approved in moderated community
        'post_removed',     // Post removed by moderator
        'system',           // System notification
        'mention',          // Mentioned in post/comment
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    // Reference to the relevant content
    reference: {
      type: {
        type: String,
        enum: ['post', 'comment', 'community', 'event', 'user'],
      },
      id: { type: mongoose.Schema.Types.ObjectId },
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Auto-expire old notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
