import Notification from '../models/Notification.js';

export async function getNotifications(req, res) {
  const notifications = await Notification.find({ user: req.user._id }).sort('-createdAt');
  res.json(notifications);
}

export async function markNotificationRead(req, res) {
  const notification = await Notification.findById(req.params.id);
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  notification.isRead = true;
  await notification.save();
  res.json(notification);
}
