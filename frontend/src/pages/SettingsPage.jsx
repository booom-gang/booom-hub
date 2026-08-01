import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, LogOut, Save, Loader2, User, Shield, Bell, Palette, HelpCircle, ChevronRight } from 'lucide-react';
import useAuth from '../hooks/useAuth.js';
import useTheme from '../hooks/useTheme.js';
import ThemeToggle from '../components/ThemeToggle.jsx';
import { Sparkles } from '../components/Decorations.jsx';
import { uploadProfilePicture } from '../services/uploadService.js';
import mediaService from '../services/mediaService.js';
import { MAX_USERNAME_LENGTH, MIN_USERNAME_LENGTH, MAX_ABOUT_LENGTH } from '../utils/constants.js';

const sidebarItems = [
  { icon: User, label: 'Edit Profile' },
  { icon: Shield, label: 'Account' },
  { icon: Bell, label: 'Notifications' },
  { icon: Palette, label: 'Theme' },
  { icon: HelpCircle, label: 'Help & Support' },
];

const SettingsPage = () => {
  const { user, updateUser, logout } = useAuth();
  const { theme } = useTheme();
  const [username, setUsername] = useState(user?.username || '');
  const [about, setAbout] = useState(user?.about || '');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('Edit Profile');
  const fileInputRef = useRef(null);

  const handleProfilePicture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadProgress(0);
    setError('');
    try {
      const result = await uploadProfilePicture({ file, userId: user._id, onProgress: setUploadProgress });
      const updated = await mediaService.updateMe({ profile_picture: result.fileKey });
      updateUser(updated);
      setSuccess('Updated!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) { setError(err.response?.data?.error || 'Failed'); } finally { setUploading(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (username.trim().length < MIN_USERNAME_LENGTH) { setError(`Min ${MIN_USERNAME_LENGTH} chars`); return; }
    if (username.trim().length > MAX_USERNAME_LENGTH) { setError(`Max ${MAX_USERNAME_LENGTH} chars`); return; }
    if (about.length > MAX_ABOUT_LENGTH) { setError(`Max ${MAX_ABOUT_LENGTH} chars`); return; }
    setSaving(true);
    try {
      const updated = await mediaService.updateMe({ username: username.trim(), about });
      updateUser(updated);
      setSuccess('Saved!');
      setTimeout(() => setSuccess(''), 2000);
    } catch (err) { setError(err.response?.data?.error || 'Failed'); } finally { setSaving(false); }
  };

  const avatarUrl = user?.profile_picture
    ? `https://wsrv.nl/?url=${encodeURIComponent(user.profile_picture)}&w=256&output=webp&q=80`
    : null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-6">
        <div className="md:w-[220px] shrink-0">
          <div className="flex md:flex-col gap-1">
            {sidebarItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${activeTab === item.label ? '' : 'hover:bg-[var(--bg-tertiary)]'}`}
                style={activeTab === item.label ? { backgroundColor: 'var(--accent)', color: '#fff' } : { color: 'var(--text-secondary)' }}
              >
                <item.icon size={16} />
                {item.label}
                {activeTab === item.label && <ChevronRight size={14} className="ml-auto" />}
              </button>
            ))}

            <div className="border-t my-2" style={{ borderColor: 'var(--border-color)' }} />

            <button
              onClick={logout}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-[var(--bg-tertiary)] w-full text-left"
              style={{ color: 'var(--danger)' }}
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>

          <div className="hidden md:block mt-6 p-4 rounded-2xl text-center" style={{ backgroundColor: 'var(--accent-light)', border: '1px solid var(--accent)' }}>
            <p className="text-xs font-bold" style={{ color: 'var(--accent)' }}>Be kind to yourself. 🧡</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>You're doing great.</p>
          </div>
        </div>

        <div className="flex-1">
          {activeTab === 'Edit Profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-dark relative">
              <Sparkles className="absolute top-4 right-4" />
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                Edit Profile <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 2, repeat: Infinity }}>✨</motion.span>
              </h2>

              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-3" style={{ borderColor: 'var(--accent)', borderWidth: 3, borderStyle: 'solid' }}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: 'var(--accent-light)', color: 'var(--accent)' }}>
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <motion.button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                    disabled={uploading}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                  </motion.button>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleProfilePicture} className="hidden" />
                </div>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{user.username}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>tap camera to change photo</p>
                </div>
              </div>

              {uploading && (
                <div className="mb-4">
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                    <motion.div className="h-full rounded-full" style={{ backgroundColor: 'var(--accent)' }} animate={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                {error && <div className="p-2.5 rounded-xl text-xs font-medium text-center" style={{ backgroundColor: 'var(--danger)', color: 'white' }}>{error}</div>}
                {success && <div className="p-2.5 rounded-xl text-xs font-medium text-center" style={{ backgroundColor: 'var(--success)', color: 'white' }}>{success}</div>}

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Full Name</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="input-dark" placeholder="Your name" maxLength={MAX_USERNAME_LENGTH} />
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>About Me</label>
                  <textarea value={about} onChange={(e) => setAbout(e.target.value)} className="input-dark resize-none" rows={3} maxLength={MAX_ABOUT_LENGTH} placeholder="Tell us about yourself..." />
                  <p className="text-[10px] mt-1 text-right" style={{ color: 'var(--text-muted)' }}>{about.length}/{MAX_ABOUT_LENGTH}</p>
                </div>

                <div>
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>Joined</label>
                  <input type="text" value={user.joined_at ? new Date(user.joined_at).toLocaleDateString() : ''} className="input-dark" disabled style={{ opacity: 0.5 }} />
                </div>

                <motion.button type="submit" disabled={saving} className="btn-accent w-full flex items-center justify-center gap-2 py-3" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </motion.button>
              </form>
            </motion.div>
          )}

          {activeTab === 'Theme' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-dark">
              <h2 className="text-lg font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Theme</h2>
              <div className="flex items-center justify-between">
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Currently: {theme}</p>
                <ThemeToggle />
              </div>
            </motion.div>
          )}

          {activeTab !== 'Edit Profile' && activeTab !== 'Theme' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-dark text-center py-12">
              <p className="text-3xl mb-2">🚧</p>
              <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>coming soon</p>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsPage;
