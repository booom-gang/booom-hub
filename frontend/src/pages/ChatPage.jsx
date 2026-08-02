import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import ChatWindow from '../components/ChatWindow.jsx';
import { StarDoodle } from '../components/Decorations.jsx';

const ChatPage = () => {
  return (
    <div className="flex flex-col h-[calc(100vh-64px-64px-48px)] md:h-[calc(100vh-64px-48px)] max-w-4xl mx-auto overflow-hidden relative">
      <StarDoodle className="absolute top-3 right-6" size={16} />

      <div className="px-5 py-3 flex items-center gap-2 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <h1 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Chat <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>💬</motion.span>
        </h1>
      </div>

      <ChatWindow />
    </div>
  );
};

export default ChatPage;
