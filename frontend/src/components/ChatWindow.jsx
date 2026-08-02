import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowDown, Send, Smile } from 'lucide-react';
import { motion } from 'framer-motion';
import ChatBubble from './ChatBubble.jsx';
import TypingIndicator from './TypingIndicator.jsx';
import messageService from '../services/messageService.js';
import useSocket from '../hooks/useSocket.js';
import useAuth from '../hooks/useAuth.js';
import { TYPING_DEBOUNCE_MS } from '../utils/constants.js';
import { formatChatDate, isDifferentDay } from '../utils/formatDate.js';

const ChatWindow = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [showNewPill, setShowNewPill] = useState(false);
  const { socket, typingUsers, emitTypingStart, emitTypingStop, onMessage } = useSocket();
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const containerRef = useRef(null);
  const isAtBottomRef = useRef(true);
  const typingTimeoutRef = useRef(null);
  const lastTypingEmitRef = useRef(0);
  const inputRef = useRef(null);

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  }, []);

  const handleScroll = useCallback(() => {
    const c = containerRef.current;
    if (!c) return;
    const atBottom = c.scrollHeight - c.scrollTop - c.clientHeight < 80;
    isAtBottomRef.current = atBottom;
    if (atBottom) setShowNewPill(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await messageService.getMessages();
        setMessages(data);
        if (data.length < 50) setHasMore(false);
        setTimeout(() => scrollToBottom('instant'), 0);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    load();
  }, [scrollToBottom]);

  useEffect(() => {
    const unsub = onMessage((msg) => {
      setMessages((prev) => {
        if (prev.some(m => m._id === msg._id)) return prev;
        const tempIdx = prev.findIndex(m =>
          m._id?.startsWith?.('temp-') &&
          m.user_id === msg.user_id &&
          m.message_text === msg.message_text
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = { ...msg, status: 'delivered' };
          return updated;
        }
        return [...prev, msg];
      });
      if (isAtBottomRef.current) setTimeout(() => scrollToBottom(), 50);
      else setShowNewPill(true);
    });
    return unsub;
  }, [onMessage, scrollToBottom]);

  useEffect(() => {
    if (!socket?.connected) {
      const poll = setInterval(async () => {
        try {
          const data = await messageService.getMessages();
          if (data.length > 0) {
            setMessages((prev) => {
              const ids = new Set(prev.map(m => m._id));
              const newMsgs = data.filter(m => !ids.has(m._id));
              if (newMsgs.length === 0) return prev;
              const merged = [...prev, ...newMsgs].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
              if (isAtBottomRef.current) setTimeout(() => scrollToBottom(), 50);
              else setShowNewPill(true);
              return merged;
            });
          }
        } catch {}
      }, 3000);
      return () => clearInterval(poll);
    }
  }, [socket?.connected, scrollToBottom]);

  const loadOlder = async () => {
    if (!hasMore || loading) return;
    try {
      const oldest = messages[0];
      if (!oldest) return;
      const data = await messageService.getMessages(oldest.timestamp);
      if (data.length === 0) { setHasMore(false); return; }
      const c = containerRef.current;
      const h = c.scrollHeight;
      setMessages((prev) => [...data, ...prev]);
      if (data.length < 50) setHasMore(false);
      setTimeout(() => { c.scrollTop = c.scrollHeight - h; }, 0);
    } catch (err) { console.error(err); }
  };

  const handleInput = () => {
    const now = Date.now();
    if (now - lastTypingEmitRef.current > 1000) { emitTypingStart(); lastTypingEmitRef.current = now; }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => emitTypingStop(), TYPING_DEBOUNCE_MS);
  };

  const sendMessage = (e) => {
    e.preventDefault();
    const text = inputRef.current?.value?.trim();
    if (!text) return;
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    emitTypingStop();

    const tempId = `temp-${Date.now()}-${Math.random()}`;
    const optimisticMsg = {
      _id: tempId,
      user_id: user?._id,
      sender_name: user?.username,
      message_text: text,
      timestamp: new Date().toISOString(),
      status: 'sending',
    };
    setMessages((prev) => [...prev, optimisticMsg]);
    if (isAtBottomRef.current) setTimeout(() => scrollToBottom(), 50);

    socket?.emit('message:send', { message_text: text }, (response) => {
      if (response?.error) {
        setMessages((prev) => prev.map(m => m._id === tempId ? { ...m, status: 'failed' } : m));
      } else {
        setMessages((prev) => prev.map(m => m._id === tempId ? { ...m, _id: response._id || response.message?._id || tempId, status: 'sent' } : m));
        setTimeout(() => {
          setMessages((prev) => prev.map(m => m._id === (response._id || response.message?._id) ? { ...m, status: 'delivered' } : m));
        }, 1000);
      }
    });

    inputRef.current.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(e); }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await messageService.deleteMessage(messageId);
      setMessages((prev) => prev.filter(m => m._id !== messageId));
      socket?.emit('message:delete', { messageId });
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const shouldShowSender = (msg, i) => i === 0 || messages[i - 1].user_id !== msg.user_id;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div className="w-6 h-6 rounded-full border-[3px] border-t-transparent" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent)' }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      <div ref={containerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto px-4 py-4" style={{ scrollbarWidth: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
        <div>
        {hasMore && messages.length > 0 && (
          <button onClick={loadOlder} className="w-full py-2 text-xs rounded-xl mb-3 hover:bg-[var(--bg-tertiary)] transition-colors font-medium" style={{ color: 'var(--text-muted)' }}>
            load older messages
          </button>
        )}
        {messages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>say something!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const showDate = i === 0 || isDifferentDay(messages[i - 1].timestamp, msg.timestamp);
          return (
            <div key={msg._id}>
              {showDate && (
                <div className="flex items-center justify-center my-4">
                  <div className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                    {formatChatDate(msg.timestamp)}
                  </div>
                </div>
              )}
              <ChatBubble message={msg} showSender={shouldShowSender(msg, i)} onDelete={handleDeleteMessage} />
            </div>
          );
        })}
        <div ref={messagesEndRef} />
        </div>
      </div>

      <AnimatePresence>
        {typingUsers.length > 0 && <TypingIndicator usernames={typingUsers} />}
      </AnimatePresence>

      {showNewPill && (
        <motion.button
          onClick={() => { scrollToBottom(); setShowNewPill(false); }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          <ArrowDown size={10} /> new
        </motion.button>
      )}

      <div className="px-4 pb-3 pt-2 shrink-0" style={{ borderTop: '1px solid var(--border-color)' }}>
        <form onSubmit={sendMessage} className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message..."
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            className="flex-1 px-4 py-2.5 rounded-full text-sm outline-none"
            style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1.5px solid var(--border-color)' }}
            maxLength={2000}
          />
          <motion.button
            type="submit"
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Send size={16} />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
