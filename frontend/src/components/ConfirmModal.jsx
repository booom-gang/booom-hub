import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title = 'Are you sure?', message = 'This cannot be undone.', confirmText = 'Delete', danger = true }) => {
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}
            className="w-full max-w-sm rounded-3xl p-6 text-center"
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--card-shadow)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ backgroundColor: danger ? 'rgba(229, 57, 53, 0.12)' : 'var(--accent-light)' }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
            >
              <AlertTriangle size={22} style={{ color: danger ? 'var(--danger)' : 'var(--accent)' }} />
            </motion.div>

            <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
              {title}
            </h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
              {message}
            </p>

            <div className="flex gap-3">
              <motion.button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full text-sm font-semibold transition-colors"
                style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Nah
              </motion.button>
              <motion.button
                onClick={() => { onConfirm(); onClose(); }}
                className="flex-1 py-2.5 rounded-full text-sm font-bold transition-colors"
                style={{
                  backgroundColor: danger ? 'var(--danger)' : 'var(--accent)',
                  color: '#fff',
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {confirmText}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
