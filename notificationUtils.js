/**
 * Notification Utility
 * Creates and sends real-time notifications
 */

const Notification = require('../models/Notification');

/**
 * Create a notification and emit via Socket.io
 */
const createNotification = async (io, { recipient, sender, type, title, message, reference }) => {
  try {
    // Don't notify yourself
    if (recipient.toString() === sender?.toString()) return null;

    const notification = await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      reference,
    });

    // Populate sender info for real-time delivery
    await notification.populate('sender', 'username displayName avatar');

    // Emit to recipient's socket room
    if (io) {
      io.to(recipient.toString()).emit('notification', notification);
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

/**
 * Notification type templates
 */
const notificationTemplates = {
  post_like: (senderName, postTitle) => ({
    title: 'New Like',
    message: `${senderName} liked your post${postTitle ? `: "${postTitle}"` : ''}`,
  }),
  post_comment: (senderName, postTitle) => ({
    title: 'New Comment',
    message: `${senderName} commented on your post${postTitle ? `: "${postTitle}"` : ''}`,
  }),
  comment_like: (senderName) => ({
    title: 'Comment Liked',
    message: `${senderName} liked your comment`,
  }),
  new_follower: (senderName) => ({
    title: 'New Follower',
    message: `${senderName} started following you`,
  }),
  community_join: (senderName, communityName) => ({
    title: 'New Member',
    message: `${senderName} joined ${communityName}`,
  }),
  event_rsvp: (senderName, eventTitle) => ({
    title: 'New RSVP',
    message: `${senderName} is going to "${eventTitle}"`,
  }),
  mention: (senderName) => ({
    title: 'You were mentioned',
    message: `${senderName} mentioned you in a post`,
  }),
};

module.exports = { createNotification, notificationTemplates };
