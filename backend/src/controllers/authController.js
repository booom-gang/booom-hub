import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const login = async (req, res, next) => {
  try {
    const { masterPassword, username } = req.body;

    if (!masterPassword || typeof masterPassword !== 'string') {
      return res.status(400).json({ error: 'Password is required' });
    }
    if (!username || typeof username !== 'string') {
      return res.status(400).json({ error: 'Username is required' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 2) {
      return res.status(400).json({ error: 'Username must be at least 2 characters' });
    }
    if (trimmedUsername.length > 30) {
      return res.status(400).json({ error: 'Username cannot exceed 30 characters' });
    }

    const passwordMatch = await bcrypt.compare(masterPassword, process.env.MASTER_PASSWORD_HASH);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    const usernameLower = trimmedUsername.toLowerCase();
    let user = await User.findOne({ username_lower: usernameLower });

    if (!user) {
      user = await User.create({
        username: trimmedUsername,
        username_lower: usernameLower,
      });
    }

    const tokenPayload = { userId: user._id.toString(), username: user.username };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '30d',
    });

    res.json({
      token,
      user: {
        _id: user._id,
        username: user.username,
        profile_picture: user.profile_picture,
        about: user.about,
        hobbies: user.hobbies,
        joined_at: user.joined_at,
      },
    });
  } catch (error) {
    next(error);
  }
};
