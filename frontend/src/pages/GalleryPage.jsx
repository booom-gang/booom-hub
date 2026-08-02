import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ChevronLeft, ChevronRight, Download, Trash2, Image as ImageIcon, Check, AlertCircle } from 'lucide-react';
import GalleryGrid from '../components/GalleryGrid.jsx';
import ConfirmModal from '../components/ConfirmModal.jsx';
import mediaService from '../services/mediaService.js';
import { uploadFile } from '../services/uploadService.js';
import { GALLERY_PAGE_SIZE, getR2Url } from '../utils/constants.js';
import useAuth from '../hooks/useAuth.js';

let uploadCounter = 0;

const GalleryPage = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewIndex, setViewIndex] = useState(null);
  const [deleteFromViewer, setDeleteFromViewer] = useState(false);
  const [pendingFiles, setPendingFiles] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadItems, setUploadItems] = useState([]);
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

  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;
    if (fileInputRef.current) fileInputRef.current.value = '';

    const previewItems = fileArray.map((file) => ({
      id: `pending-${++uploadCounter}`,
      file,
      fileName: file.name,
      preview: URL.createObjectURL(file),
      progress: 0,
      status: 'pending',
    }));

    setPendingFiles(previewItems);
  };

  const handleUploadAll = async () => {
    if (!pendingFiles || pendingFiles.length === 0) return;
    setUploading(true);

    setUploadItems(pendingFiles.map((f) => ({ ...f, status: 'uploading' })));

    const promises = pendingFiles.map((fileObj, i) => {
      return new Promise(async (resolve) => {
        let r2Result = null;
        try {
          r2Result = await uploadFile({
            file: fileObj.file,
            mediaKind: 'gallery-image',
            onProgress: (p) => {
              setUploadItems((prev) => prev.map((item, idx) =>
                idx === i ? { ...item, progress: p } : item
              ));
            },
          });
          await mediaService.createGalleryItem({
            media_type: 'image',
            file_key: r2Result.fileKey,
            file_size_bytes: r2Result.fileSizeBytes,
          });
          setUploadItems((prev) => prev.map((item, idx) =>
            idx === i ? { ...item, status: 'done', progress: 100 } : item
          ));
          resolve();
        } catch (err) {
          console.error(err);
          if (r2Result?.fileKey) {
            try { await mediaService.cleanupR2(r2Result.fileKey); } catch {}
          }
          setUploadItems((prev) => prev.map((item, idx) =>
            idx === i ? { ...item, status: 'error' } : item
          ));
          resolve();
        }
      });
    });

    await Promise.all(promises);
    setUploading(false);
    fetchGallery(1);

    setTimeout(() => {
      setPendingFiles(null);
      setUploadItems([]);
      pendingFiles?.forEach((f) => URL.revokeObjectURL(f.preview));
    }, 2000);
  };

  const closePending = () => {
    pendingFiles?.forEach((f) => URL.revokeObjectURL(f.preview));
    setPendingFiles(null);
    setUploadItems([]);
    setUploading(false);
  };

  const removePendingItem = (id) => {
    setPendingFiles((prev) => {
      const item = prev?.find((f) => f.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev?.filter((f) => f.id !== id) || null;
    });
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
          const newIdx = Math.min(viewIndex, next.length - 1);
          setViewIndex(newIdx >= 0 ? newIdx : null);
        }
        return next;
      });
    } catch (err) { console.error(err); }
    setDeleteTarget(null);
    setConfirmOpen(false);
  };

  const viewItems = items;

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
    const url = currentItem.proxy_url || getR2Url(currentItem.file_key);
    const name = `booom-${currentItem.user_id?.username || 'media'}-${Date.now()}.jpg`;
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

  const pendingCount = pendingFiles?.length || 0;
  const doneCount = uploadItems.filter((u) => u.status === 'done').length;
  const errorCount = uploadItems.filter((u) => u.status === 'error').length;

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
          Gallery <ImageIcon size={18} style={{ color: 'var(--accent)' }} />
        </h1>
        <label className="cursor-pointer">
          <div className="btn-accent text-xs flex items-center gap-1.5 py-2 px-4" style={{ borderRadius: '9999px' }}>
            <Upload size={14} />
            Upload
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />
        </label>
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

      {/* Upload Preview Modal */}
      <AnimatePresence>
        {pendingFiles && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-3">
                <button onClick={closePending} className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <X size={18} style={{ color: 'var(--text-primary)' }} />
                </button>
                <div>
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Upload</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                    {uploading
                      ? `${doneCount + errorCount} / ${pendingCount} ${errorCount > 0 ? `(${errorCount} failed)` : ''}`
                      : `${pendingCount} files selected`
                    }
                  </p>
                </div>
              </div>
              {!uploading && (
                <button
                  onClick={handleUploadAll}
                  className="text-xs font-bold py-2 px-5 rounded-full"
                  style={{ backgroundColor: 'var(--accent)', color: '#fff' }}
                >
                  Upload All
                </button>
              )}
              {uploading && (
                <div className="w-5 h-5 rounded-full border-[3px] border-t-transparent" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
                {pendingFiles.map((fileObj) => {
                  const uploadState = uploadItems.find((u) => u.id === fileObj.id);
                  const status = uploadState?.status || 'pending';
                  const progress = uploadState?.progress || 0;

                  return (
                    <div key={fileObj.id} className="relative aspect-square rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                      <img src={fileObj.preview} alt="" className="w-full h-full object-cover" style={{ opacity: status === 'error' ? 0.4 : status === 'done' ? 0.5 : 0.8 }} />
                      {status === 'pending' && (
                        <button
                          onClick={() => removePendingItem(fileObj.id)}
                          className="absolute top-1.5 left-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}
                        >
                          <X size={10} color="white" />
                        </button>
                      )}
                      {status === 'uploading' && (
                        <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
                          <div className="h-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }} />
                        </div>
                      )}
                      {status === 'done' && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                            <Check size={14} color="white" />
                          </div>
                        </div>
                      )}
                      {status === 'error' && (
                        <div className="absolute inset-0 flex items-center justify-center" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                          <AlertCircle size={20} color="#ef4444" />
                        </div>
                      )}
                      <div className="absolute bottom-1 left-1 right-1">
                        <p className="text-[8px] truncate px-1 py-0.5 rounded" style={{ backgroundColor: 'rgba(0,0,0,0.5)', color: '#fff' }}>
                          {fileObj.fileName}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Viewer */}
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
                <button onClick={handleViewerDownload} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                  <Download size={16} color="white" />
                </button>
                {isCurrentOwner && (
                  <button onClick={handleDeleteFromViewer} className="w-9 h-9 rounded-full flex items-center justify-center bg-white/10 hover:bg-red-600/60 transition-colors">
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
              <img
                src={currentItem.proxy_url || getR2Url(currentItem.file_key)}
                alt=""
                className="max-w-full max-h-full object-contain"
                onError={(e) => { const raw = getR2Url(currentItem.file_key); if (raw && e.target.src !== raw) e.target.src = raw; }}
              />
              {viewIndex < viewItems.length - 1 && (
                <button onClick={nextView} className="absolute right-2 z-10 w-10 h-10 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 transition-colors">
                  <ChevronRight size={20} color="white" />
                </button>
              )}
            </div>

            <div className="shrink-0 py-2 flex justify-center gap-1 px-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {viewItems.map((item, i) => (
                <button
                  key={item._id}
                  onClick={() => setViewIndex(i)}
                  className="shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors"
                  style={{ borderColor: i === viewIndex ? 'var(--accent)' : 'transparent' }}
                >
                  <img src={item.proxy_url || getR2Url(item.file_key)} alt="" className="w-full h-full object-cover" onError={(e) => { const raw = getR2Url(item.file_key); if (raw && e.target.src !== raw) e.target.src = raw; }} />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => { setConfirmOpen(false); setDeleteTarget(null); setDeleteFromViewer(false); }}
        onConfirm={confirmDelete}
        title="Delete this?"
        message="This image will be permanently removed."
        confirmText="Delete it"
      />
    </div>
  );
};

export default GalleryPage;
