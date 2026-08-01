import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import useTheme from '../hooks/useTheme.js';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-colors hover:bg-[var(--bg-tertiary)] ${className}`}
      aria-label="Toggle theme"
      whileHover={{ rotate: 20 }}
      whileTap={{ scale: 0.8, rotate: -20 }}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' || theme === 'dark' ? (
          theme === 'dark' ? (
            <motion.div key="moon" initial={{ rotate: -90, opacity: 0, scale: 0 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: 90, opacity: 0, scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Moon size={16} style={{ color: 'var(--text-muted)' }} />
            </motion.div>
          ) : (
            <motion.div key="sun" initial={{ rotate: 90, opacity: 0, scale: 0 }} animate={{ rotate: 0, opacity: 1, scale: 1 }} exit={{ rotate: -90, opacity: 0, scale: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
              <Sun size={16} style={{ color: 'var(--text-muted)' }} />
            </motion.div>
          )
        ) : null}
      </AnimatePresence>
    </motion.button>
  );
};

export default ThemeToggle;
