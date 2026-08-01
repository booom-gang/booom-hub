import { motion } from 'framer-motion';

const LoadingSpinner = ({ size = 40 }) => {
  return (
    <div className="flex items-center justify-center p-8">
      <motion.div
        className="rounded-full border-4 border-t-transparent animate-spin"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--border-color)',
          borderTopColor: 'var(--accent)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
};

export default LoadingSpinner;
