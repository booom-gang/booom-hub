import { motion } from 'framer-motion';
import { HeartIcon, Sparkles } from './Decorations.jsx';
import { formatDate } from '../utils/formatDate.js';
import { useState } from 'react';

const ProfileCard = ({ user }) => {
  const [liked, setLiked] = useState(false);
  const avatarUrl = user.profile_picture
    ? `https://wsrv.nl/?url=${encodeURIComponent(user.profile_picture)}&w=512&output=webp&q=80`
    : null;

  return (
    <motion.div
      className="w-full max-w-[340px] mx-auto rounded-[2rem] overflow-hidden relative"
      style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--card-shadow)',
      }}
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="relative h-52 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, var(--accent) 0%, #c45a1a 100%)',
            opacity: 0.15,
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-32 h-32 rounded-full overflow-hidden border-4"
            style={{ borderColor: 'var(--bg-card)' }}
            whileHover={{ scale: 1.08 }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-5xl font-bold"
                style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </motion.div>
        </div>

        <motion.button
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
          onClick={() => setLiked(!liked)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          <HeartIcon filled={liked} size={18} />
        </motion.button>

        <Sparkles className="top-2 left-3" />
        <Sparkles className="bottom-3 right-8" style={{ animationDelay: '-1s' }} />
      </div>

      <div className="px-6 pt-4 pb-6 text-center">
        <div
          className="inline-block px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3"
          style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
        >
          NEW FRIEND ✦
        </div>

        <h3
          className="text-2xl font-bold tracking-tight mb-1"
          style={{ color: 'var(--text-primary)' }}
        >
          {user.username} ✦
        </h3>

        {user.about && (
          <p
            className="text-sm mb-4 max-w-[240px] mx-auto"
            style={{ color: 'var(--text-secondary)' }}
          >
            {user.about}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          {['Coffee', 'Cooking', 'Travel', 'Music'].slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-[11px] font-medium flex items-center gap-1"
              style={{
                backgroundColor: 'var(--accent-light)',
                color: 'var(--accent)',
                border: '1px solid var(--accent)',
              }}
            >
              {tag === 'Coffee' && '☕'} {tag === 'Cooking' && '🍳'} {tag === 'Travel' && '✈️'} {tag === 'Music' && '🎵'}
              {tag}
            </span>
          ))}
        </div>

        <p
          className="text-[10px] tracking-widest uppercase font-medium"
          style={{ color: 'var(--text-muted)' }}
        >
          SINCE {formatDate(user.joined_at).toUpperCase()}
        </p>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
