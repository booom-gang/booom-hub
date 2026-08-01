import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, Image } from 'lucide-react';
import CardDeck from '../components/CardDeck.jsx';
import { StarDoodle, Squiggle, CuteMascot } from '../components/Decorations.jsx';
import useAuth from '../hooks/useAuth.js';
import mediaService from '../services/mediaService.js';

const HomePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await mediaService.getAllUsers();
        setUsers(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col relative overflow-hidden">
      <StarDoodle className="absolute top-20 left-6" size={30} />
      <StarDoodle className="absolute top-32 right-10" size={18} />
      <Squiggle className="absolute top-40 left-2" />
      <StarDoodle className="absolute bottom-40 left-12" size={16} color="var(--accent)" />

      <div className="px-5 pt-5 pb-1 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            hey {user?.username} <motion.span animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }} transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}>👋</motion.span>
          </h1>
          <p className="text-xs mt-0.5 tracking-wide" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            {users.length} surprises in the crew
          </p>
        </motion.div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-4 relative z-10">
        {loading ? (
          <motion.div
            className="w-7 h-7 rounded-full border-[3px] border-t-transparent"
            style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent)' }}
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.1 }}
          >
            <CardDeck users={users} />
          </motion.div>
        )}
      </div>

      <div className="px-5 pb-6 md:pb-4 pb-24 relative z-10">
        <div className="flex items-center justify-center gap-3">
          <motion.button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 text-sm py-2.5 px-5 rounded-full font-bold"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 6px 24px var(--accent-glow)' }}
            whileTap={{ scale: 0.95 }}
          >
            <Image size={15} />
            View Profile
          </motion.button>
          <motion.button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 text-sm py-2.5 px-5 rounded-full font-semibold"
            style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            <MessageCircle size={15} />
            Message
          </motion.button>
        </div>
      </div>

      <div className="absolute bottom-20 left-4 opacity-20 pointer-events-none">
        <CuteMascot />
      </div>
    </div>
  );
};

export default HomePage;
