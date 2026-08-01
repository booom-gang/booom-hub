import Event from '../models/Event.js';
import { validateEventInput } from '../utils/validators.js';

export const getEvents = async (req, res, next) => {
  try {
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);

    if (!month || !year || month < 1 || month > 12) {
      return res.status(400).json({ error: 'Valid month and year are required' });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);

    const events = await Event.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .sort({ date: 1 })
      .populate('created_by', 'username profile_picture');

    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const errors = validateEventInput(req.body);
    if (errors) {
      return res.status(400).json({ error: errors.join(', ') });
    }

    const event = await Event.create({
      title: req.body.title.trim(),
      description: (req.body.description || '').trim(),
      date: new Date(req.body.date),
      created_by: req.user.userId,
    });

    const populated = await Event.findById(event._id).populate('created_by', 'username profile_picture');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only edit your own events' });
    }

    if (req.body.title !== undefined) {
      if (typeof req.body.title !== 'string' || req.body.title.trim().length === 0) {
        return res.status(400).json({ error: 'Title cannot be empty' });
      }
      if (req.body.title.trim().length > 120) {
        return res.status(400).json({ error: 'Title cannot exceed 120 characters' });
      }
      event.title = req.body.title.trim();
    }

    if (req.body.description !== undefined) {
      if (typeof req.body.description === 'string' && req.body.description.length > 1000) {
        return res.status(400).json({ error: 'Description cannot exceed 1000 characters' });
      }
      event.description = (req.body.description || '').trim();
    }

    if (req.body.date !== undefined) {
      const parsed = new Date(req.body.date);
      if (isNaN(parsed.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }
      event.date = parsed;
    }

    await event.save();
    const populated = await Event.findById(event._id).populate('created_by', 'username profile_picture');
    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (event.created_by.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own events' });
    }

    await Event.findByIdAndDelete(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};
