import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, Image, MessageCircle, Calendar, Settings } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/gallery', icon: Image, label: 'Gallery' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/calendar', icon: Calendar, label: 'Cal' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const MobileBottomNav = () => {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-30"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderTop: '1px solid var(--border-color)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around pt-2 pb-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className="relative flex flex-col items-center gap-0.5 py-1 px-3"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div
                    layoutId="mobile-active"
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.div
                  animate={isActive ? { scale: 1.15, y: -1 } : { scale: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
                >
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.7} />
                </motion.div>
                <span
                  className="text-[10px]"
                  style={{
                    color: isActive ? 'var(--accent)' : 'var(--text-muted)',
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default MobileBottomNav;
