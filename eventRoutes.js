const express = require('express');
const router = express.Router();
const { createEvent, getEvents, getEvent, rsvpEvent, updateEvent, cancelEvent } = require('../controllers/eventController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { createEventValidator } = require('../middleware/validationMiddleware');

router.get('/', optionalAuth, getEvents);
router.post('/', protect, createEventValidator, createEvent);
router.get('/:id', optionalAuth, getEvent);
router.put('/:id', protect, updateEvent);
router.post('/:id/rsvp', protect, rsvpEvent);
router.post('/:id/cancel', protect, cancelEvent);

module.exports = router;
