import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';
import { StarDoodle, Squiggle } from './Decorations.jsx';
import useAuth from '../hooks/useAuth.js';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [masterPassword, setMasterPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();

  const validate = () => {
    const errs = {};
    if (!username.trim() || username.trim().length < 2) errs.username = 'at least 2 chars';
    if (!masterPassword) errs.masterPassword = 'required';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      await login(masterPassword, username.trim());
    } catch (err) {
      setError(err.response?.data?.error || 'nope, try again');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <StarDoodle className="absolute top-20 left-10" size={32} />
      <StarDoodle className="absolute top-40 right-16" size={20} />
      <Squiggle className="absolute bottom-32 left-8" />
      <StarDoodle className="absolute bottom-20 right-10" size={24} color="var(--accent)" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', bounce: 0.3 }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="text-center mb-10">
          <motion.h1
            className="text-6xl sm:text-7xl font-bold tracking-tighter mb-3"
            style={{ color: 'var(--accent)' }}
            animate={{ rotate: [0, -2, 2, -1, 0] }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            BOOOM‼️
          </motion.h1>
          <motion.p
            className="text-sm tracking-wide font-medium"
            style={{ color: 'var(--text-muted)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            the crew's private spot ✦
          </motion.p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-3 rounded-2xl text-sm text-center font-medium" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>
              {error}
            </motion.div>
          )}

          <div>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-dark text-center text-lg" placeholder="what should we call you?" autoFocus />
            {fieldErrors.username && <p className="text-xs mt-1.5 text-center font-medium" style={{ color: 'var(--danger)' }}>{fieldErrors.username}</p>}
          </div>

          <div>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={masterPassword} onChange={(e) => setMasterPassword(e.target.value)} className="input-dark text-center pr-10" placeholder="secret password" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-transform hover:scale-110 active:scale-90" style={{ color: 'var(--text-muted)' }}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.masterPassword && <p className="text-xs mt-1.5 text-center font-medium" style={{ color: 'var(--danger)' }}>{fieldErrors.masterPassword}</p>}
          </div>

          <motion.button type="submit" disabled={isSubmitting} className="btn-accent w-full flex items-center justify-center gap-2 py-3.5 text-sm" whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <>let me in <ArrowRight size={16} /></>}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginForm;
