import jwt from 'jsonwebtoken';
import Message from '../models/Message.js';
import User from '../models/User.js';

const connectedUsers = new Map();

const chatSocket = (io) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication required'));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { userId: decoded.userId, username: decoded.username };
      next();
    } catch (error) {
      return next(new Error('Invalid or expired token'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.user.username}`);

    connectedUsers.set(socket.user.userId, {
      socketId: socket.id,
      username: socket.user.username,
    });

    io.emit('presence:update', {
      onlineUserIds: Array.from(connectedUsers.keys()),
    });

    socket.on('message:send', async (data) => {
      try {
        const text = data?.message_text;
        if (!text || typeof text !== 'string' || text.trim().length === 0) {
          return socket.emit('error', { message: 'Message cannot be empty' });
        }
        if (text.length > 2000) {
          return socket.emit('error', { message: 'Message cannot exceed 2000 characters' });
        }

        const user = await User.findById(socket.user.userId);
        if (!user) {
          return socket.emit('error', { message: 'User not found' });
        }

        const message = await Message.create({
          user_id: socket.user.userId,
          sender_name: user.username,
          message_text: text.trim(),
        });

        const populated = {
          _id: message._id,
          user_id: message.user_id,
          sender_name: message.sender_name,
          message_text: message.message_text,
          timestamp: message.timestamp,
        };

        io.emit('message:new', populated);
      } catch (error) {
        console.error('Send message error:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('typing:start', () => {
      socket.broadcast.emit('typing:update', {
        username: socket.user.username,
        isTyping: true,
      });
    });

    socket.on('typing:stop', () => {
      socket.broadcast.emit('typing:update', {
        username: socket.user.username,
        isTyping: false,
      });
    });

    socket.on('disconnect', () => {
      connectedUsers.delete(socket.user.userId);
      io.emit('presence:update', {
        onlineUserIds: Array.from(connectedUsers.keys()),
      });
      console.log(`User disconnected: ${socket.user.username}`);
    });
  });
};

export default chatSocket;
