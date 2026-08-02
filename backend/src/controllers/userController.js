import User from '../models/User.js';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import r2Client from '../config/r2Client.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-__v').sort({ joined_at: 1 });
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    const updates = {};
    const allowedFields = ['username', 'about', 'profile_picture', 'hobbies'];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'username') {
          const trimmed = req.body[field].trim();
          if (trimmed.length < 2) {
            return res.status(400).json({ error: 'Username must be at least 2 characters' });
          }
          if (trimmed.length > 30) {
            return res.status(400).json({ error: 'Username cannot exceed 30 characters' });
          }
          const usernameLower = trimmed.toLowerCase();
          const existing = await User.findOne({ username_lower: usernameLower, _id: { $ne: req.user.userId } });
          if (existing) {
            return res.status(400).json({ error: 'Username is already taken' });
          }
          updates.username = trimmed;
          updates.username_lower = usernameLower;
        } else if (field === 'about') {
          const trimmed = String(req.body[field]).trim();
          if (trimmed.length > 300) {
            return res.status(400).json({ error: 'About text cannot exceed 300 characters' });
          }
          updates.about = trimmed;
        } else if (field === 'hobbies') {
          if (!Array.isArray(req.body[field])) {
            return res.status(400).json({ error: 'Hobbies must be an array' });
          }
          updates.hobbies = req.body[field].slice(0, 10).map(h => String(h).trim()).filter(Boolean);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const user = await User.findByIdAndUpdate(req.user.userId, updates, { new: true, runValidators: true }).select('-__v');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.profile_picture) {
      try {
        await r2Client.send(new DeleteObjectCommand({
          Bucket: process.env.R2_BUCKET_NAME,
          Key: user.profile_picture,
        }));
      } catch (r2Error) {
        console.error('R2 delete error:', r2Error);
      }
    }

    await User.findByIdAndDelete(req.user.userId);
    res.json({ message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};

export const deleteProfilePicture = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!user.profile_picture) {
      return res.status(400).json({ error: 'No profile picture to delete' });
    }

    const fileKey = user.profile_picture;

    try {
      await r2Client.send(new DeleteObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME,
        Key: fileKey,
      }));
    } catch (r2Error) {
      console.error('R2 delete error:', r2Error);
    }

    user.profile_picture = null;
    await user.save();

    const updatedUser = await User.findById(req.user.userId).select('-__v');
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};
