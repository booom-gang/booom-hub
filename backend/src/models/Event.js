import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    maxlength: [120, 'Title cannot exceed 120 characters'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters'],
    default: '',
    trim: true,
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

eventSchema.index({ date: 1 });

eventSchema.virtual('creator', {
  ref: 'User',
  localField: 'created_by',
  foreignField: '_id',
  justOne: true,
});

eventSchema.set('toObject', { virtuals: true });
eventSchema.set('toJSON', { virtuals: true });

const Event = mongoose.model('Event', eventSchema);

export default Event;
