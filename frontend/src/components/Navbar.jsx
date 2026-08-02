import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Image, MessageCircle, Calendar, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle.jsx';
import useAuth from '../hooks/useAuth.js';
import { getR2Url } from '../utils/constants.js';

const navLinks = [
  { to: '/home', icon: Home, label: 'Home' },
  { to: '/gallery', icon: Image, label: 'Gallery' },
  { to: '/chat', icon: MessageCircle, label: 'Chat' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-30 h-16"
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        <NavLink to="/" className="select-none">
          <motion.span
            className="text-2xl sm:text-2xl font-bold tracking-tight"
            style={{ color: 'var(--accent)' }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            BOOOM‼️
          </motion.span>
        </NavLink>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-pill ${isActive ? 'active' : ''}`}
            >
              <link.icon size={15} />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <motion.button
            onClick={logout}
            className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[var(--bg-tertiary)] transition-colors"
            style={{ color: 'var(--danger)' }}
            whileHover={{ rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            title="Log out"
          >
            <LogOut size={16} />
          </motion.button>
          <motion.button
            onClick={() => navigate('/settings')}
            className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {user?.profile_picture ? (
              <img
                src={`https://wsrv.nl/?url=${encodeURIComponent(getR2Url(user.profile_picture))}&w=80&output=webp&q=80`}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              user?.username?.charAt(0).toUpperCase()
            )}
          </motion.button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
