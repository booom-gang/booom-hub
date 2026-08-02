import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatChatTimestamp } from '../utils/formatDate.js';
import { Check, CheckCheck, Clock, Trash2 } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';

const StatusIcon = ({ status }) => {
  if (status === 'sending') return <Clock size={10} />;
  if (status === 'sent') return <Check size={10} />;
  if (status === 'delivered') return <CheckCheck size={10} />;
  return null;
};

const ChatBubble = ({ message, showSender, onDelete }) => {
  const { user } = useAuth();
  const isOwn = message.user_id === user?._id || message.user_id?._id === user?._id;
  const [showMenu, setShowMenu] = useState(false);

  const handleLongPress = () => {
    if (isOwn) setShowMenu(!showMenu);
  };

  const handleDelete = () => {
    setShowMenu(false);
    onDelete?.(message._id);
  };

  return (
    <motion.div
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-1.5 relative`}
      initial={{ opacity: 0, y: 8, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      {showSender && !isOwn && (
        <div className="flex items-center gap-1.5 px-1 mb-0.5">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
            {(message.sender_name || '?').charAt(0).toUpperCase()}
          </div>
          <span className="text-[10px] font-semibold" style={{ color: 'var(--text-muted)' }}>
            {message.sender_name}
          </span>
        </div>
      )}

      <div className="relative" style={{ maxWidth: '80%' }}>
        <div
          className={`inline-block px-3.5 py-2 text-[14px] leading-relaxed ${
            isOwn ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'
          }`}
          style={{
            backgroundColor: isOwn ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: isOwn ? '#fff' : 'var(--text-primary)',
          }}
          onClick={handleLongPress}
        >
          <p className="whitespace-pre-wrap break-words">{message.message_text}</p>
        </div>

        <AnimatePresence>
          {showMenu && isOwn && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -5 }}
              className="absolute -top-10 right-0 flex gap-1 z-20"
            >
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1"
                style={{ backgroundColor: 'var(--danger)', color: '#fff' }}
              >
                <Trash2 size={10} /> Delete
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-1 px-1">
        <span
          className="text-[9px] mt-0.5"
          style={{ color: 'var(--text-muted)' }}
        >
          {formatChatTimestamp(message.timestamp)}
        </span>
        {isOwn && message.status && (
          <span style={{ color: 'var(--text-muted)' }}>
            <StatusIcon status={message.status} />
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default ChatBubble;
