export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
export const R2_PUBLIC_BASE_URL = 'https://pub-501242c723764e14886d44043d655896.r2.dev';

export const getR2Url = (fileKey) => {
  if (!fileKey) return null;
  if (fileKey.startsWith('http')) return fileKey;
  return `${R2_PUBLIC_BASE_URL}/${fileKey}`;
};

export const MAX_MESSAGE_LENGTH = 2000;
export const MAX_USERNAME_LENGTH = 30;
export const MIN_USERNAME_LENGTH = 2;
export const MAX_ABOUT_LENGTH = 300;
export const MAX_EVENT_TITLE_LENGTH = 120;
export const MAX_EVENT_DESCRIPTION_LENGTH = 1000;

export const VIDEO_MAX_SIZE_MB = 150;
export const VIDEO_MAX_DURATION_SECONDS = 300;
export const GALLERY_PAGE_SIZE = 24;

export const TYPING_DEBOUNCE_MS = 3000;
export const CARD_AUTO_ADVANCE_MS = 5000;
