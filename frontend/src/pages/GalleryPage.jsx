import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ChevronLeft, ChevronRight, Play, Pause, Music, Download } from 'lucide-react';
import GalleryGrid from '../components/GalleryGrid.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import { StarDoodle, Sparkles } from '../components/Decorations.jsx';
import mediaService from '../services/mediaService.js';
import { uploadFile } from '../services/uploadService.js';
import { GALLERY_PAGE_SIZE, getR2Url } from '../utils/constants.js';

const FILTERS = ['All', 'Photos', 'Videos'];

const activeUploads = new Map();
const uploadListeners = new Set();

const notifyUploadListeners = (uploads) => {
  uploadListeners.forEach((fn) => fn(uploads));
};

const GalleryPage = () => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [uploads, setUploads] = useState([]);
  const [filter, setFilter] = useState('All');
  const [slideshow, setSlideshow] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [slideshowPaused, setSlideshowPaused] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [videoViewer, setVideoViewer] = useState(null);
  const abortControllersRef = useRef(new Map());

  const fetchGallery = useCallback(async (pageNum, append = false) => {
    try {
      const data = await mediaService.getGallery(pageNum, GALLERY_PAGE_SIZE);
      if (append) setItems((prev) => [...prev, ...data.items]);
      else setItems(data.items);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGallery(1); }, [fetchGallery]);

  useEffect(() => {
    const listener = (u) => setUploads([...u]);
    uploadListeners.add(listener);
    setUploads([...activeUploads.values()]);
    return () => uploadListeners.delete(listener);
  }, []);

  useEffect(() => {
    return () => {
      abortControllersRef.current.forEach((ctrl) => ctrl.abort());
    };
  }, []);

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    for (const file of fileArray) {
      const uploadId = `upload-${Date.now()}-${Math.random()}`;
      const controller = new AbortController();
      abortControllersRef.current.set(uploadId, controller);

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
          if (!controller.signal.aborted) {
            await mediaService.createGalleryItem({
              media_type: file.type.startsWith('video/') ? 'video' : 'image',
              file_key: result.fileKey,
              thumbnail_key: result.thumbnailKey,
              file_size_bytes: result.fileSizeBytes,
            });
            const e = activeUploads.get(uploadId);
            if (e) { e.status = 'done'; e.progress = 100; notifyUploadListeners(activeUploads); }
            fetchGallery(1);
          }
        } catch (err) {
          if (err.name !== 'AbortError') {
            console.error(err);
            const e = activeUploads.get(uploadId);
            if (e) { e.status = 'error'; notifyUploadListeners(activeUploads); }
          }
        } finally {
          activeUploads.delete(uploadId);
          abortControllersRef.current.delete(uploadId);
          notifyUploadListeners(activeUploads);
        }
      })();
    }
  };

  const handleDelete = async (id) => {
    setDeleteTarget(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try { await mediaService.deleteGalleryItem(deleteTarget); setItems((prev) => prev.filter((i) => i._id !== deleteTarget)); } catch (err) { console.error(err); }
    setDeleteTarget(null);
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'Photos') return item.media_type === 'image';
    if (filter === 'Videos') return item.media_type === 'video';
    return true;
  });

  const startSlideshow = (idx = 0) => { setSlideshowIndex(idx); setSlideshow(true); setSlideshowPaused(false); };
  const closeSlideshow = () => { setSlideshow(false); };
  const nextSlide = () => { setSlideshowIndex((p) => (p + 1) % filteredItems.length); setSlideshowPaused(false); };
  const prevSlide = () => { setSlideshowIndex((p) => (p - 1 + filteredItems.length) % filteredItems.length); setSlideshowPaused(false); };

  useEffect(() => {
    if (!slideshow || slideshowPaused) return;
    const item = filteredItems[slideshowIndex];
    if (item?.media_type === 'image') {
      const t = setTimeout(nextSlide, 4000);
      return () => clearTimeout(t);
    }
  }, [slideshow, slideshowIndex, slideshowPaused, filteredItems]);

  useEffect(() => {
    if (!slideshow) return;
    const h = (e) => {
      if (e.key === 'Escape') closeSlideshow();
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === ' ') { e.preventDefault(); setSlideshowPaused((p) => !p); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [slideshow]);

  const currentItem = filteredItems[slideshowIndex];

  const handleSlideshowDownload = async () => {
    if (!currentItem) return;
    const rawKey = currentItem.file_key;
    const url = currentItem.media_type === 'video' ? getR2Url(rawKey) : (currentItem.proxy_url || getR2Url(rawKey));
    const ext = currentItem.media_type === 'video' ? 'mp4' : 'jpg';
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
    <div className="max-w-6xl mx-auto px-4 py-6 relative">
      <StarDoodle className="absolute top-2 right-8" size={20} />
      <Sparkles className="absolute top-8 right-24" />

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Gallery <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 4 }}>✨</motion.span>
        </h1>
        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <motion.button
              onClick={() => startSlideshow(0)}
              className="btn-ghost text-xs flex items-center gap-1.5 py-1.5 px-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Music size={12} /> vibes ✦
            </motion.button>
          )}
          <label className="cursor-pointer">
            <motion.div
              className="btn-accent text-xs flex items-center gap-1.5 py-1.5 px-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Upload size={12} />
              {uploads.length > 0 ? `${uploads.length} uploading` : 'Upload'}
            </motion.div>
            <input type="file" accept="image/*,video/*" multiple onChange={(e) => handleFiles(e.target.files)} className="hidden" />
          </label>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
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
          <GalleryGrid items={filteredItems} onDelete={handleDelete} onPreview={(t, s, i) => startSlideshow(i)} />
          {page < totalPages && (
            <div className="text-center mt-8">
              <motion.button onClick={() => { setPage((p) => p + 1); fetchGallery(page + 1, true); }} className="btn-ghost text-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Load More
              </motion.button>
            </div>
          )}
        </>
      )}

      <AnimatePresence>
        {slideshow && currentItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: '#000' }}>
            <button onClick={closeSlideshow} className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
              <X size={20} color="white" />
            </button>
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronLeft size={20} color="white" />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
              <ChevronRight size={20} color="white" />
            </button>

            <div className="w-full h-full flex items-center justify-center p-16">
              {currentItem.media_type === 'image' ? (
                <motion.img key={currentItem._id} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }} src={currentItem.proxy_url?.replace('w=400', 'w=1600')} alt="" className="max-w-full max-h-full object-contain rounded-xl" />
              ) : (
                <div className="w-full h-full flex items-center justify-center p-4">
                  <video
                    key={currentItem._id}
                    controls
                    autoPlay
                    playsInline
                    className="max-w-full max-h-full object-contain rounded-xl"
                    src={getR2Url(currentItem.file_key)}
                    poster={currentItem.thumbnail_proxy_url?.replace('w=400', 'w=1200')}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4">
              <button onClick={handleSlideshowDownload} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors" title="Download">
                <Download size={16} color="white" />
              </button>
              <button onClick={() => setSlideshowPaused((p) => !p)} className="w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                {slideshowPaused ? <Play size={16} fill="white" color="white" /> : <Pause size={16} color="white" />}
              </button>
              <div className="flex gap-1.5">
                {filteredItems.map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ backgroundColor: i === slideshowIndex ? 'var(--accent)' : 'rgba(255,255,255,0.3)' }} />
                ))}
              </div>
              <span className="text-white/40 text-xs">{slideshowIndex + 1}/{filteredItems.length}</span>
            </div>

            <div className="absolute top-4 left-4 text-white/40 text-xs">{currentItem.user_id?.username || ''}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null); }}
        onConfirm={confirmDelete}
        title="Delete this?"
        message="This media will be permanently removed."
        confirmText="Delete it"
      />
    </div>
  );
};

export default GalleryPage;
