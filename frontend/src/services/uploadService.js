import axios from 'axios';
import imageCompression from 'browser-image-compression';
import mediaService from './mediaService.js';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const generateVideoThumbnail = (file) => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.preload = 'metadata';
    video.muted = true;

    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadeddata = () => {
      video.currentTime = 1;
    };

    video.onseeked = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          resolve(blob);
        },
        'image/jpeg',
        0.8
      );
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to generate video thumbnail'));
    };
  });
};

export const uploadFile = async ({ file, userId, mediaKind, onProgress }) => {
  if (useMocks) {
    if (onProgress) {
      for (let p = 0; p <= 100; p += 20) {
        await new Promise((r) => setTimeout(r, 50));
        onProgress(p);
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }
    return {
      fileKey: `${mediaKind}/mock-${Date.now()}-${file.name}`,
      thumbnailKey: null,
      publicUrl: `https://mock-r2.example.com/${mediaKind}/${file.name}`,
      fileSizeBytes: file.size,
    };
  }

  let fileToUpload = file;
  let fileName = file.name;
  let fileType = file.type;

  if (file.type.startsWith('image/') && mediaKind === 'gallery-image') {
    fileToUpload = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
      fileType: 'image/webp',
    });
    fileName = fileName.replace(/\.[^.]+$/, '.webp');
    fileType = 'image/webp';
  }

  const { uploadUrl, fileKey, publicUrl } = await mediaService.getPresignedUrl(fileName, fileType, mediaKind);

  await axios.put(uploadUrl, fileToUpload, {
    headers: { 'Content-Type': fileType },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  let thumbnailKey = null;
  if (file.type.startsWith('video/') && mediaKind === 'gallery-video') {
    if (onProgress) onProgress(95);

    const thumbBlob = await generateVideoThumbnail(file);
    const thumbFileName = `thumbnail-${Date.now()}.jpg`;

    const thumbResult = await mediaService.getPresignedUrl(thumbFileName, 'image/jpeg', 'gallery-video-thumb');

    await axios.put(thumbResult.uploadUrl, thumbBlob, {
      headers: { 'Content-Type': 'image/jpeg' },
    });

    thumbnailKey = thumbResult.fileKey;
  }

  return { fileKey, thumbnailKey, publicUrl, fileSizeBytes: fileToUpload.size || file.size };
};

export const uploadProfilePicture = async ({ file, userId, onProgress }) => {
  if (useMocks) {
    if (onProgress) {
      for (let p = 0; p <= 100; p += 25) {
        await new Promise((r) => setTimeout(r, 50));
        onProgress(p);
      }
    } else {
      await new Promise((r) => setTimeout(r, 300));
    }
    return { fileKey: `profile-picture/mock-${Date.now()}-${file.name}` };
  }

  const fileToUpload = await imageCompression(file, {
    maxSizeMB: 0.5,
    maxWidthOrHeight: 512,
    useWebWorker: true,
    fileType: 'image/webp',
  });

  const fileName = file.name.replace(/\.[^.]+$/, '.webp');

  const { uploadUrl, fileKey } = await mediaService.getPresignedUrl(fileName, 'image/webp', 'profile-picture');

  await axios.put(uploadUrl, fileToUpload, {
    headers: { 'Content-Type': 'image/webp' },
    onUploadProgress: (e) => {
      if (e.total && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return { fileKey };
};
