import imageCompression from 'browser-image-compression';

export const compressImage = async (file, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/webp',
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    const compressed = await imageCompression(file, mergedOptions);
    return compressed;
  } catch (error) {
    throw new Error(`Image compression failed: ${error.message}`);
  }
};
