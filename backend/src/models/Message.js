import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sender_name: {
    type: String,
    required: [true, 'Sender name is required'],
    trim: true,
  },
  message_text: {
    type: String,
    required: [true, 'Message text is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters'],
    trim: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

messageSchema.index({ timestamp: 1 });

const Message = mongoose.model('Message', messageSchema);

export default Message;
