import axios from 'axios';
import imageCompression from 'browser-image-compression';
import mediaService from './mediaService.js';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

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

  return { fileKey, publicUrl, fileSizeBytes: fileToUpload.size || file.size };
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
