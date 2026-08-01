import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [2, 'Username must be at least 2 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  username_lower: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
  },
  profile_picture: {
    type: String,
    default: null,
  },
  about: {
    type: String,
    maxlength: [300, 'About text cannot exceed 300 characters'],
    default: '',
  },
  hobbies: {
    type: [String],
    default: [],
  },
  joined_at: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', function (next) {
  if (this.isModified('username')) {
    this.username_lower = this.username.toLowerCase();
  }
  next();
});

userSchema.index({ username_lower: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

export default User;
