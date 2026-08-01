import Message from '../models/Message.js';

export const getMessages = async (req, res, next) => {
  try {
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 50));
    const query = {};

    if (req.query.before) {
      const beforeDate = new Date(req.query.before);
      if (isNaN(beforeDate.getTime())) {
        return res.status(400).json({ error: 'Invalid before timestamp' });
      }
      query.timestamp = { $lt: beforeDate };
    }

    const messages = await Message.find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-__v')
      .lean();

    res.json(messages.reverse());
  } catch (error) {
    next(error);
  }
};
