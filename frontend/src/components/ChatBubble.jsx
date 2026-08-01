import { motion } from 'framer-motion';
import { formatTime } from '../utils/formatDate.js';
import useAuth from '../hooks/useAuth.js';

const ChatBubble = ({ message, showSender }) => {
  const { user } = useAuth();
  const isOwn = message.user_id === user?._id || message.user_id?._id === user?._id;

  return (
    <motion.div
      className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} mb-1.5`}
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

      <div
        className={`max-w-[78%] px-3.5 py-2 text-[14px] leading-relaxed ${
          isOwn ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-bl-md'
        }`}
        style={{
          backgroundColor: isOwn ? 'var(--accent)' : 'var(--bg-tertiary)',
          color: isOwn ? '#fff' : 'var(--text-primary)',
        }}
      >
        <p className="whitespace-pre-wrap break-words">{message.message_text}</p>
      </div>
    </motion.div>
  );
};

export default ChatBubble;
