import mongoose from 'mongoose';

const galleryItemSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  media_type: {
    type: String,
    enum: ['image', 'video'],
    required: [true, 'Media type is required'],
  },
  file_key: {
    type: String,
    required: [true, 'File key is required'],
  },
  thumbnail_key: {
    type: String,
    default: null,
  },
  file_size_bytes: {
    type: Number,
    required: [true, 'File size is required'],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

galleryItemSchema.index({ created_at: -1 });

galleryItemSchema.virtual('user', {
  ref: 'User',
  localField: 'user_id',
  foreignField: '_id',
  justOne: true,
});

galleryItemSchema.set('toObject', { virtuals: true });
galleryItemSchema.set('toJSON', { virtuals: true });

const GalleryItem = mongoose.model('GalleryItem', galleryItemSchema, 'gallery');

export default GalleryItem;
