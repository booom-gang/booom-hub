import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { uploadFile } from '../services/uploadService.js';
import mediaService from '../services/mediaService.js';
import { VIDEO_MAX_SIZE_MB } from '../utils/constants.js';

const UploadBar = ({ onUploadComplete }) => {
  const [uploads, setUploads] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (file.type.startsWith('video/')) {
      if (file.size > VIDEO_MAX_SIZE_MB * 1024 * 1024) {
        return `Video must be under ${VIDEO_MAX_SIZE_MB}MB`;
      }
    } else if (!file.type.startsWith('image/')) {
      return 'Only images and videos are supported';
    }
    return null;
  };

  const addUpload = (file) => {
    const error = validateFile(file);
    const upload = {
      id: Date.now() + Math.random(),
      file,
      name: file.name,
      progress: 0,
      status: error ? 'error' : 'pending',
      error,
    };
    setUploads((prev) => [...prev, upload]);
    return upload;
  };

  const removeUpload = (id) => {
    setUploads((prev) => prev.filter((u) => u.id !== id));
  };

  const startUpload = async (uploadId) => {
    setUploads((prev) =>
      prev.map((u) => (u.id === uploadId ? { ...u, status: 'uploading', progress: 0 } : u))
    );

    const upload = uploads.find((u) => u.id === uploadId);
    if (!upload || upload.error) return;

    try {
      const mediaKind = upload.file.type.startsWith('video/') ? 'gallery-video' : 'gallery-image';

      const result = await uploadFile({
        file: upload.file,
        mediaKind,
        onProgress: (progress) => {
          setUploads((prev) =>
            prev.map((u) => (u.id === uploadId ? { ...u, progress } : u))
          );
        },
      });

      await mediaService.createGalleryItem({
        media_type: upload.file.type.startsWith('video/') ? 'video' : 'image',
        file_key: result.fileKey,
        thumbnail_key: result.thumbnailKey,
        file_size_bytes: result.fileSizeBytes,
      });

      setUploads((prev) =>
        prev.map((u) => (u.id === uploadId ? { ...u, status: 'complete', progress: 100 } : u))
      );

      onUploadComplete?.();

      setTimeout(() => removeUpload(uploadId), 2000);
    } catch (err) {
      setUploads((prev) =>
        prev.map((u) =>
          u.id === uploadId
            ? { ...u, status: 'error', error: err.message || 'Upload failed' }
            : u
        )
      );
    }
  };

  const handleFiles = (files) => {
    const newUploads = Array.from(files).map((file) => addUpload(file));
    newUploads.filter((u) => !u.error).forEach((u) => startUpload(u.id));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files);
      e.target.value = '';
    }
  };

  const getUploadIcon = (status) => {
    switch (status) {
      case 'uploading':
        return <Loader2 size={16} className="animate-spin" style={{ color: 'var(--accent)' }} />;
      case 'complete':
        return <CheckCircle size={16} style={{ color: 'var(--success)' }} />;
      case 'error':
        return <AlertCircle size={16} style={{ color: 'var(--danger)' }} />;
      default:
        return <Upload size={16} style={{ color: 'var(--text-muted)' }} />;
    }
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
          isDragOver ? 'scale-[1.02]' : ''
        }`}
        style={{
          borderColor: isDragOver ? 'var(--accent)' : 'var(--border-color)',
          backgroundColor: isDragOver ? 'var(--accent-light)' : 'var(--bg-secondary)',
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <Upload
          size={32}
          className="mx-auto mb-2"
          style={{ color: isDragOver ? 'var(--accent)' : 'var(--text-muted)' }}
        />
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          Drag & drop files here, or <span style={{ color: 'var(--accent)' }}>browse</span>
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          Images (auto-compressed) and videos up to 150MB
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      <AnimatePresence>
        {uploads.map((upload) => (
          <motion.div
            key={upload.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg p-3"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div className="flex items-center gap-3">
              {getUploadIcon(upload.status)}
              <div className="flex-1 min-w-0">
                <p
                  className="text-sm font-medium truncate"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {upload.name}
                </p>
                {upload.status === 'uploading' && (
                  <div
                    className="w-full h-1.5 rounded-full mt-1.5 overflow-hidden"
                    style={{ backgroundColor: 'var(--border-color)' }}
                  >
                    <motion.div
                      className="h-full rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${upload.progress}%` }}
                    />
                  </div>
                )}
                {upload.error && (
                  <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>
                    {upload.error}
                  </p>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeUpload(upload.id);
                }}
                className="p-1 rounded hover:bg-[var(--bg-tertiary)] transition-colors"
              >
                <X size={14} style={{ color: 'var(--text-muted)' }} />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default UploadBar;
