import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ChevronLeft, ChevronRight, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import GalleryGrid from '../components/GalleryGrid.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import mediaService from '../services/mediaService.js';
import { uploadFile } from '../services/uploadService.js';
import { GALLERY_PAGE_SIZE, getR2Url } from '../utils/constants.js';
import useAuth from '../hooks/useAuth.js';

const FILTERS = ['All', 'Photos', 'Videos'];

const activeUploads = new Map();
const uploadListeners = new Set();
const notifyUploadListeners = (u) => uploadListeners.forEach((fn) => fn(u));

const GalleryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [filter, setFilter] = useState('All');
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewIndex, setViewIndex] = useState(null);
  const [deleteFromViewer, setDeleteFromViewer] = useState(false);
  const fileInputRef = useRef(null);

  const fetchGallery = useCallback(async (pageNum, append = false) => {
    try {
      const data = await mediaService.getGallery(pageNum, GALLERY_PAGE_SIZE);
      if (append) setItems((prev) => [...prev, ...data.items]);
      else setItems(data.items);
      setTotalPages(data.totalPages);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGallery(1); }, [fetchGallery]);

  useEffect(() => {
    const listener = (u) => setUploads([...u]);
    uploadListeners.add(listener);
    setUploads([...activeUploads.values()]);
    return () => uploadListeners.delete(listener);
  }, []);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    for (const file of fileArray) {
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      const uploadEntry = { id: uploadId, fileName: file.name, progress: 0, status: 'uploading' };
      activeUploads.set(uploadId, uploadEntry);
      notifyUploadListeners(activeUploads);

      (async () => {
        try {
          const mediaKind = file.type.startsWith('video/') ? 'gallery-video' : 'gallery-image';
          const result = await uploadFile({
            file, mediaKind,
            onProgress: (p) => {
              const e = activeUploads.get(uploadId);
              if (e) { e.progress = p; notifyUploadListeners(activeUploads); }
            },
          });
          await mediaService.createGalleryItem({
            media_type: file.type.startsWith('video/') ? 'video' : 'image',
            file_key: result.fileKey,
            thumbnail_key: result.thumbnailKey,
            file_size_bytes: result.fileSizeBytes,
          });
          activeUploads.delete(uploadId);
          notifyUploadListeners(activeUploads);
          fetchGallery(1);
        } catch (err) {
          console.error(err);
          const e = activeUploads.get(uploadId);
          if (e) { e.status = 'error'; notifyUploadListeners(activeUploads); }
          setTimeout(() => { activeUploads.delete(uploadId); notifyUploadListeners(activeUploads); }, 3000);
        }
      })();
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setDeleteFromViewer(false);
    setConfirmOpen(true);
  };

  const handleDeleteFromViewer = () => {
    if (!viewItems[viewIndex]) return;
    setDeleteTarget(viewItems[viewIndex]._id);
    setDeleteFromViewer(true);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await mediaService.deleteGalleryItem(deleteTarget);
      setItems((prev) => {
        const next = prev.filter((i) => i._id !== deleteTarget);
        if (deleteFromViewer) {
          const newIdx = Math.min(viewIndex, next.filter((item) => {
            if (filter === 'Photos') return item.media_type === 'image';
            if (filter === 'Videos') return item.media_type === 'video';
            return true;
          }).length - 1);
          setViewIndex(newIdx >= 0 ? newIdx : null);
        }
        return next;
      });
    } catch (err) { console.error(err); }
    setDeleteTarget(null);
    setConfirmOpen(false);
  };

  const viewItems = items.filter((item) => {
    if (filter === 'Photos') return item.media_type === 'image';
    if (filter === 'Videos') return item.media_type === 'video';
    return true;
  });

  const openViewer = (idx) => setViewIndex(idx);
  const closeViewer = () => setViewIndex(null);
  const nextView = () => setViewIndex((p) => (p + 1) % viewItems.length);
  const prevView = () => setViewIndex((p) => (p - 1 + viewItems.length) % viewItems.length);

  useEffect(() => {
    if (viewIndex === null) return;
    const h = (e) => {
      if (e.key === 'Escape') closeViewer();
      if (e.key === 'ArrowRight') nextView();
      if (e.key === 'ArrowLeft') prevView();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [viewIndex, viewItems.length]);

  const currentItem = viewIndex !== null ? viewItems[viewIndex] : null;
  const isCurrentOwner = currentItem?.user_id?._id === user?._id || currentItem?.user_id === user?._id;

  const handleViewerDownload = async () => {
    if (!currentItem) return;
    const isVideo = currentItem.media_type === 'video';
    const url = isVideo ? getR2Url(currentItem.file_key) : (currentItem.proxy_url || getR2Url(currentItem.file_key));
    const ext = isVideo ? 'mp4' : 'jpg';
    const name = `booom-${currentItem.user_id?.username || 'media'}-${Date.now()}.${ext}`;
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
    <div className="max-w-6xl mx-auto px-3 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Gallery <ImageIcon size={18} style={{ color: 'var(--accent)' }} />
        </h1>
        <div className="flex items-center gap-2">
          {uploads.length > 0 && (
            <span className="text-[10px] font-bold px-2 py-1 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)', color: '#fff' }}>
              {uploads.length} uploading
            </span>
          )}
          <label className="cursor-pointer">
            <div className="btn-accent text-xs flex items-center gap-1.5 py-2 px-4" style={{ borderRadius: '9999px' }}>
              <Upload size={14} />
              Upload
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </label>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`filter-chip ${filter === f ? 'active' : ''}`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <motion.div className="w-6 h-6 rounded-full border-[3px] border-t-transparent" style={{ borderColor: 'var(--border-color)', borderTopColor: 'var(--accent)' }} animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
        </div>
      ) : (
        <>
          <GalleryGrid items={viewItems} onDelete={handleDelete} onView={openViewer} />
          {page < totalPages && (
            <div className="text-center mt-6">
              <motion.button onClick={() => { setPage((p) => p + 1); fetchGallery(page + 1, true); }} className="btn-ghost text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Load More
              </motion.button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {viewIndex !== null && currentItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: '#000' }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0">
              <div className="flex items-center gap-3">
                <button onClick={closeViewer} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                  <X size={18} color="white" />
                </button>
                <div>
                  <p className="text-white text-sm font-semibold">{currentItem.user_id?.username || ''}</p>
                  <p className="text-white/40 text-[10px]">{viewIndex + 1} / {viewItems.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleViewerDownload} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors" title="Download">
                  <Download size={16} color="white" />
                </button>
                {isCurrentOwner && (
                  <button onClick={handleDeleteFromViewer} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-600/60 transition-colors" title="Delete">
                    <Trash2 size={16} color="white" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex-1 min-h-0 relative flex items-center justify-center">
              {viewIndex > 0 && (
                <button onClick={prevView} className="absolute left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                  <ChevronLeft size={20} color="white" />
                </button>
              )}

              {currentItem.media_type === 'image' ? (
                <img
                  src={currentItem.proxy_url || getR2Url(currentItem.file_key)}
                  alt=""
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => {
                    const raw = getR2Url(currentItem.file_key);
                    if (raw && e.target.src !== raw) e.target.src = raw;
                  }}
                />
              ) : (
                <video
                  key={currentItem._id}
                  controls
                  playsInline
                  className="max-w-full max-h-full object-contain"
                  src={getR2Url(currentItem.file_key)}
                  poster={currentItem.thumbnail_proxy_url}
                />
              )}

              {viewIndex < viewItems.length - 1 && (
                <button onClick={nextView} className="absolute right-2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                  <ChevronRight size={20} color="white" />
                </button>
              )}
            </div>

            {currentItem.media_type === 'image' && (
              <div className="shrink-0 py-2 flex justify-center gap-1 px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
                {viewItems.map((item, i) => (
                  <button
                    key={item._id}
                    onClick={() => setViewIndex(i)}
                    className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors"
                    style={{ borderColor: i === viewIndex ? 'var(--accent)' : 'transparent' }}
                  >
                    <img
                      src={item.thumbnail_proxy_url || item.proxy_url || getR2Url(item.file_key)}
                      alt=""
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const raw = getR2Url(item.file_key);
                        if (raw && e.target.src !== raw) e.target.src = raw;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null); setDeleteFromViewer(false); }}
        onConfirm={confirmDelete}
        title="Delete this?"
        message="This media will be permanently removed."
        confirmText="Delete it"
      />
    </div>
  );
};

export default GalleryPage;
