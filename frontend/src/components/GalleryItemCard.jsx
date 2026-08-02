import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trash2, Download } from 'lucide-react';
import { formatRelativeTime } from '../utils/formatDate.js';
import { getR2Url } from '../utils/constants.js';
import useAuth from '../hooks/useAuth.js';

const GalleryItemCard = ({ item, onDelete, onView, index }) => {
  const { user } = useAuth();
  const isVideo = item.media_type === 'video';
  const thumbnailUrl = isVideo ? (item.thumbnail_proxy_url || item.proxy_url) : item.proxy_url;
  const isOwner = item.user_id?._id === user?._id || item.user_id === user?._id;

  const handleDownload = async (e) => {
    e.stopPropagation();
    const rawKey = item.file_key;
    const url = isVideo ? getR2Url(rawKey) : (item.proxy_url || getR2Url(rawKey));
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

  return (
    <motion.div
      className="relative group cursor-pointer overflow-hidden rounded-xl"
      style={{ backgroundColor: 'var(--bg-tertiary)' }}
      onClick={() => onView(index)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <div className="aspect-square">
        <img
          src={thumbnailUrl}
          alt=""
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => {
            const raw = getR2Url(item.file_key);
            if (raw && e.target.src !== raw) e.target.src = raw;
          }}
        />
      </div>

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-10 h-10 rounded-full flex items-center justify-center bg-black/40">
            <Play size={16} fill="white" color="white" />
          </div>
        </div>
      )}

      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 pointer-events-none"
        style={{ background: 'linear-gradient(transparent 60%, rgba(0,0,0,0.6))' }}
      >
        <div className="flex items-center gap-1.5 ml-auto pointer-events-auto">
          <button
            onClick={handleDownload}
            className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 hover:bg-black/60 transition-colors"
          >
            <Download size={12} color="white" />
          </button>
          {isOwner && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item._id); }}
              className="w-7 h-7 rounded-full flex items-center justify-center bg-black/40 hover:bg-red-600/80 transition-colors"
            >
              <Trash2 size={12} color="white" />
            </button>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <p className="text-white/70 text-[10px]">{formatRelativeTime(item.created_at)}</p>
      </div>
    </motion.div>
  );
};

export default GalleryItemCard;
