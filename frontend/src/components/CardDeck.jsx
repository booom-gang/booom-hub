import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProfileCard from './ProfileCard.jsx';
import { StarDoodle, Squiggle, Dots } from './Decorations.jsx';
import { CARD_AUTO_ADVANCE_MS } from '../utils/constants.js';

const CardDeck = ({ users }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [direction, setDirection] = useState(1);

  const nextCard = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % users.length);
  }, [users.length]);

  const prevCard = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + users.length) % users.length);
  }, [users.length]);

  useEffect(() => {
    if (isPaused || users.length <= 1) return;
    const interval = setInterval(nextCard, CARD_AUTO_ADVANCE_MS);
    return () => clearInterval(interval);
  }, [isPaused, users.length, nextCard]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') nextCard();
      if (e.key === 'ArrowLeft') prevCard();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [nextCard, prevCard]);

  if (users.length === 0) return null;

  const user = users[currentIndex];

  return (
    <div
      className="relative w-full max-w-lg mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <StarDoodle className="absolute -top-6 -left-4 text-2xl" size={28} />
      <StarDoodle className="absolute top-10 -right-6" size={20} color="var(--accent)" />
      <Squiggle className="absolute -bottom-4 left-8" />
      <Dots className="absolute bottom-16 -right-4" />

      <div className="relative px-12">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={user._id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 100, scale: 0.85, rotate: direction * 3 }}
            animate={{ opacity: 1, x: 0, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, x: direction * -100, scale: 0.85, rotate: direction * -3 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          >
            <ProfileCard user={user} />
          </motion.div>
        </AnimatePresence>

        {users.length > 1 && (
          <>
            <motion.button
              onClick={prevCard}
              className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              whileHover={{ scale: 1.1, x: -2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronLeft size={18} style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
            <motion.button
              onClick={nextCard}
              className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
              whileHover={{ scale: 1.1, x: 2 }}
              whileTap={{ scale: 0.9 }}
            >
              <ChevronRight size={18} style={{ color: 'var(--text-secondary)' }} />
            </motion.button>
          </>
        )}
      </div>

      {users.length > 1 && (
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
            {currentIndex + 1} / {users.length}
          </span>
          <div className="flex gap-1.5">
            {users.map((_, i) => (
              <motion.button
                key={i}
                onClick={() => { setDirection(i > currentIndex ? 1 : -1); setCurrentIndex(i); }}
                className="rounded-full"
                style={{
                  width: i === currentIndex ? 24 : 8,
                  height: 8,
                  backgroundColor: i === currentIndex ? 'var(--accent)' : 'var(--border-color)',
                }}
                animate={{ width: i === currentIndex ? 24 : 8 }}
                whileHover={{ scale: 1.3 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CardDeck;
