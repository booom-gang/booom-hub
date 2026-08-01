import { createContext, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { mockMessages_svc } from '../utils/mockData.js';

export const SocketContext = createContext();

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const MOCK_REPLIES = [
  'Nice!',
  'Sounds good to me',
  'I agree!',
  'Cool!',
  "Can't wait!",
  'See you there!',
];
const MOCK_USERS = ['Alex', 'Jordan', 'Sam'];

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const mockListenersRef = useRef({ 'message:new': [] });

  useEffect(() => {
    if (useMocks) {
      setOnlineUserIds(['u1', 'u2', 'u3', 'u4', 'u5']);
      return;
    }

    const token = localStorage.getItem('jwt');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
    });

    newSocket.on('presence:update', (data) => {
      setOnlineUserIds(data.onlineUserIds);
    });

    newSocket.on('typing:update', (data) => {
      setTypingUsers((prev) => {
        if (data.isTyping) {
          if (prev.includes(data.username)) return prev;
          return [...prev, data.username];
        } else {
          return prev.filter((u) => u !== data.username);
        }
      });
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const emitTypingStart = () => {
    if (useMocks) return;
    socketRef.current?.emit('typing:start');
  };

  const emitTypingStop = () => {
    if (useMocks) return;
    socketRef.current?.emit('typing:stop');
  };

  const sendMessage = (messageText) => {
    if (useMocks) {
      const saved = mockMessages_svc.add(messageText);
      const listeners = mockListenersRef.current['message:new'] || [];
      listeners.forEach((cb) => cb(saved));

      if (Math.random() > 0.4) {
        setTimeout(() => {
          const replyUser = MOCK_USERS[Math.floor(Math.random() * MOCK_USERS.length)];
          const replyText = MOCK_REPLIES[Math.floor(Math.random() * MOCK_REPLIES.length)];

          const fakeMsg = {
            _id: 'm' + Date.now(),
            user_id: replyUser.toLowerCase(),
            sender_name: replyUser,
            message_text: replyText,
            timestamp: new Date().toISOString(),
          };

          const msgListeners = mockListenersRef.current['message:new'] || [];
          msgListeners.forEach((cb) => cb(fakeMsg));
        }, 1500 + Math.random() * 2000);
      }
      return;
    }
    socketRef.current?.emit('message:send', { message_text: messageText });
  };

  const onMessage = (callback) => {
    if (useMocks) {
      if (!mockListenersRef.current['message:new']) {
        mockListenersRef.current['message:new'] = [];
      }
      mockListenersRef.current['message:new'].push(callback);
      return () => {
        mockListenersRef.current['message:new'] = mockListenersRef.current['message:new'].filter(
          (cb) => cb !== callback
        );
      };
    }
    socketRef.current?.on('message:new', callback);
    return () => socketRef.current?.off('message:new', callback);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        onlineUserIds,
        typingUsers,
        emitTypingStart,
        emitTypingStop,
        sendMessage,
        onMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
