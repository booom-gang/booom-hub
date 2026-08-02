import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, Download, X } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatDate.js';
import useAuth from '../hooks/useAuth.js';

const GalleryItemCard = ({ item, onDelete, onPreview, index }) => {
  const [hovered, setHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { user } = useAuth();
  const isVideo = item.media_type === 'video';
  const thumbnailUrl = isVideo ? (item.thumbnail_proxy_url || item.proxy_url) : item.proxy_url;
  const isOwner = item.user_id?._id === user?._id || item.user_id === user?._id;

  const handleDownload = async (e) => {
    e.stopPropagation();
    const url = item.proxy_url || item.file_key;
    const ext = isVideo ? 'mp4' : 'jpg';
    const name = `booom-${item.user_id?.username || 'media'}-${Date.now()}.${ext}`;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = name;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch { window.open(url, '_blank'); }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    setShowActions(!showActions);
  };

  const handlePreview = (e) => {
    e.stopPropagation();
    onPreview?.(isVideo ? 'video' : 'image', thumbnailUrl, index);
  };

  return (
    <motion.div
      className="relative group cursor-pointer overflow-hidden rounded-2xl"
      style={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); if (!showActions) setShowActions(false); }}
      onClick={handleClick}
      whileHover={{ y: -4, boxShadow: '0 8px 30px rgb(0 0 0 / 0.3)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className="aspect-square">
        <img src={thumbnailUrl} alt="" className="w-full h-full object-cover transition-transform duration-300" style={{ transform: hovered ? 'scale(1.06)' : 'scale(1)' }} loading="lazy" />
      </div>

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <Play size={20} fill="white" color="white" />
          </div>
        </div>
      )}

      <motion.div
        initial={false}
        animate={{ opacity: hovered || showActions ? 1 : 0 }}
        transition={{ duration: 0.15 }}
        className="absolute inset-0 flex flex-col justify-between p-3 pointer-events-none"
        style={{ background: 'linear-gradient(transparent 40%, rgba(0,0,0,0.7))' }}
      >
        <div className="flex justify-between items-start pointer-events-auto">
          {showActions && (
            <motion.button
              onClick={(e) => { e.stopPropagation(); setShowActions(false); }}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X size={12} color="white" />
            </motion.button>
          )}
          <div className="flex gap-1.5 ml-auto">
            <motion.button
              onClick={handleDownload}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              title="Download"
            >
              <Download size={12} color="white" />
            </motion.button>
            {isOwner && (
              <motion.button
                onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Trash2 size={12} color="white" />
              </motion.button>
            )}
          </div>
        </div>

        <div className="pointer-events-auto">
          {isVideo && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mb-1 inline-block" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              vibes ✦
            </span>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-white text-xs font-semibold">{item.user_id?.username || 'Unknown'}</span>
          </div>
          <p className="text-white/50 text-[10px]">{formatRelativeTime(item.created_at)}</p>
          {showActions && isVideo && (
            <motion.button
              onClick={handlePreview}
              className="mt-2 px-3 py-1 rounded-full text-[10px] font-bold"
              style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Play Video
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default GalleryItemCard;
