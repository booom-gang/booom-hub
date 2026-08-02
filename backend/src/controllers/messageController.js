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

export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.user_id.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'You can only delete your own messages' });
    }

    await Message.findByIdAndDelete(req.params.id);

    res.json({ message: 'Message deleted successfully', deletedId: req.params.id });
  } catch (error) {
    next(error);
  }
};
