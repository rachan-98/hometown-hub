import Event from '../models/Event.js';

export async function createEvent(req, res) {
  const event = await Event.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(event);
}

export async function getEvents(req, res) {
  const events = await Event.find().populate('createdBy', 'name').populate('community', 'name').sort('date');
  res.json(events);
}

export async function joinEvent(req, res) {
  const event = await Event.findById(req.params.id);
  if (!event) return res.status(404).json({ message: 'Event not found' });
  if (!event.attendees.includes(req.user._id)) event.attendees.push(req.user._id);
  await event.save();
  res.json(event);
}
