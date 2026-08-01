import { motion, AnimatePresence } from 'framer-motion';
import { X, Home, Image, MessageCircle, Calendar, Settings } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navLinks = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/gallery', label: 'Gallery', icon: Image },
  { to: '/chat', label: 'Chat', icon: MessageCircle },
  { to: '/calendar', label: 'Calendar', icon: Calendar },
  { to: '/settings', label: 'Settings', icon: Settings },
];

const MobileDrawer = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40"
            style={{ backgroundColor: 'var(--modal-overlay)' }}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] z-50 p-6"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex items-center justify-between mb-8">
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                Menu
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <X size={20} style={{ color: 'var(--text-secondary)' }} />
              </button>
            </div>

            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors duration-150 ${
                      isActive ? 'font-medium' : ''
                    }`
                  }
                  style={({ isActive }) => ({
                    backgroundColor: isActive ? 'var(--accent-light)' : 'transparent',
                    color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                  })}
                >
                  <link.icon size={20} />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MobileDrawer;
