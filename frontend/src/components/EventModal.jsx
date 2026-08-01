import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Clock } from 'lucide-react';

const EventModal = ({ isOpen, onClose, onSave, event: editingEvent }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingEvent) {
      setTitle(editingEvent.title || '');
      setDescription(editingEvent.description || '');
      const d = new Date(editingEvent.date);
      setDate(d.toISOString().slice(0, 16));
    } else {
      setTitle('');
      setDescription('');
      setDate(new Date().toISOString().slice(0, 16));
    }
    setError('');
  }, [editingEvent, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!title.trim()) { setError('Title required'); return; }
    if (!date) { setError('Date required'); return; }
    try {
      await onSave({ title: title.trim(), description: description.trim(), date: new Date(date).toISOString() });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'var(--modal-overlay)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full max-w-md rounded-3xl overflow-hidden"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 60px rgb(0 0 0 / 0.4)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: '1px solid var(--border-color)' }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  <Calendar size={16} />
                </div>
                <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                  {editingEvent ? 'Edit Event' : 'New Event'}
                </h2>
              </div>
              <motion.button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"
                whileHover={{ rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={16} style={{ color: 'var(--text-muted)' }} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="p-3 rounded-2xl text-xs font-medium text-center"
                  style={{ backgroundColor: 'var(--danger)', color: 'white' }}
                >
                  {error}
                </motion.div>
              )}

              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="input-dark"
                  placeholder="What's happening?"
                  maxLength={120}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Date & Time
                </label>
                <div className="relative">
                  <input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-dark"
                  />
                  <Clock size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-dark resize-none"
                  rows={3}
                  placeholder="Add details (optional)"
                  maxLength={1000}
                />
                <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>
                  {description.length}/1000
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <motion.button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-full text-sm font-semibold"
                  style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  className="flex-1 py-3 rounded-full text-sm font-bold"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 20px var(--accent-glow)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  {editingEvent ? 'Update' : 'Create'}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventModal;
