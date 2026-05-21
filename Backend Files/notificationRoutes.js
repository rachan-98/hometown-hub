// notificationRoutes.js
const express = require('express');
const notifRouter = express.Router();
const { getNotifications, markAsRead, deleteNotification } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

notifRouter.get('/', protect, getNotifications);
notifRouter.put('/read', protect, markAsRead);
notifRouter.delete('/:id', protect, deleteNotification);

module.exports = notifRouter;
