import { motion } from 'framer-motion';
import CalendarView from '../components/CalendarView.jsx';

const CalendarPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h1 className="text-2xl font-bold mb-5 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Calendar <motion.span animate={{ rotate: [0, 15, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}>📅</motion.span>
        </h1>
        <CalendarView />
      </motion.div>
    </div>
  );
};

export default CalendarPage;
