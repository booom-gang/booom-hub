import { motion } from 'framer-motion';

const TypingIndicator = ({ usernames }) => {
  if (!usernames || usernames.length === 0) return null;

  const text =
    usernames.length === 1
      ? `${usernames[0]} is typing`
      : usernames.length === 2
      ? `${usernames[0]} and ${usernames[1]} are typing`
      : `${usernames[0]} and ${usernames.length - 1} others are typing`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 4 }}
      className="flex items-center gap-1.5 px-4 py-1.5"
    >
      <div className="flex gap-0.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1 h-1 rounded-full"
            style={{ backgroundColor: 'var(--text-muted)' }}
            animate={{
              scale: [0.5, 1, 0.5],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: i * 0.15,
            }}
          />
        ))}
      </div>
      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
        {text}
      </span>
    </motion.div>
  );
};

export default TypingIndicator;
