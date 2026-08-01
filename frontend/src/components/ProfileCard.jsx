import { motion } from 'framer-motion';
import { Heart, Calendar } from 'lucide-react';
import { formatDate } from '../utils/formatDate.js';
import { getR2Url } from '../utils/constants.js';
import { useState } from 'react';

const HOBBY_EMOJIS = {
  coffee: '☕', cooking: '🍳', travel: '✈️', music: '🎵', gaming: '🎮',
  sports: '⚽', reading: '📚', art: '🎨', photography: '📷', movies: '🎬',
  hiking: '🥾', yoga: '🧘', dancing: '💃', swimming: '🏊', cycling: '🚴',
  fishing: '🎣', gardening: '🌱', coding: '💻', fashion: '👗', food: '🍕',
};

const getHobbyEmoji = (hobby) => {
  const lower = hobby.toLowerCase();
  return HOBBY_EMOJIS[lower] || '✦';
};

const ProfileCard = ({ user }) => {
  const [liked, setLiked] = useState(false);
  const rawUrl = getR2Url(user.profile_picture);
  const avatarUrl = rawUrl
    ? `https://wsrv.nl/?url=${encodeURIComponent(rawUrl)}&w=800&output=webp&q=80`
    : null;
  const hobbies = user.hobbies || [];

  return (
    <motion.div
      className="w-full max-w-[400px] mx-auto rounded-[2rem] overflow-hidden relative"
      style={{
        backgroundColor: '#1a1208',
        border: '2px solid var(--accent)',
        boxShadow: '0 0 30px rgba(242, 121, 43, 0.2), 0 8px 32px rgba(0,0,0,0.5)',
      }}
      whileHover={{ y: -6, boxShadow: '0 0 40px rgba(242, 121, 43, 0.3), 0 12px 40px rgba(0,0,0,0.6)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="relative h-80 overflow-hidden">
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-7xl font-bold"
            style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}

        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to bottom, transparent 50%, #1a1208 100%)' }}
        />

        <div className="absolute top-3 left-3">
          <div
            className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1"
            style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
          >
            ✦ NEW FRIEND
          </div>
        </div>

        <motion.button
          className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'rgba(30,20,10,0.7)', border: '1px solid rgba(242,121,43,0.3)', backdropFilter: 'blur(8px)' }}
          onClick={() => setLiked(!liked)}
          whileHover={{ scale: 1.15 }}
          whileTap={{ scale: 0.85 }}
        >
          <Heart size={18} color="var(--accent)" fill={liked ? 'var(--accent)' : 'none'} />
        </motion.button>
      </div>

      <div className="px-6 pt-4 pb-6">
        <h3
          className="text-3xl font-bold tracking-tight mb-4"
          style={{ color: 'var(--text-primary)' }}
        >
          {user.username} <span style={{ color: 'var(--accent)' }}>✦</span>
        </h3>

        {hobbies.length > 0 && (
          <div className="flex items-center gap-2 mb-5 flex-wrap">
            {hobbies.slice(0, 3).map((hobby) => (
              <span
                key={hobby}
                className="px-3 py-1.5 rounded-full text-[12px] font-semibold flex items-center gap-1.5"
                style={{
                  backgroundColor: 'rgba(242, 121, 43, 0.1)',
                  color: 'var(--accent)',
                  border: '1px solid rgba(242, 121, 43, 0.4)',
                }}
              >
                {getHobbyEmoji(hobby)} {hobby}
              </span>
            ))}
          </div>
        )}

        <div
          className="flex items-center justify-center gap-2 pt-4"
          style={{ borderTop: '1px solid rgba(242,121,43,0.15)' }}
        >
          <Calendar size={12} style={{ color: 'var(--text-muted)' }} />
          <p
            className="text-[11px] tracking-widest uppercase font-medium"
            style={{ color: 'var(--text-muted)' }}
          >
            SINCE {formatDate(user.joined_at).toUpperCase()}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileCard;
