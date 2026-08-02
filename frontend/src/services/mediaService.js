import api from './api.js';
import { mockGallery, mockUsers } from '../utils/mockData.js';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const mediaService = {
  getPresignedUrl: async (fileName, fileType, mediaKind) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      return {
        uploadUrl: 'https://mock-r2.example.com/upload',
        fileKey: `${mediaKind}/${fileName}`,
        publicUrl: `https://mock-r2.example.com/${mediaKind}/${fileName}`,
      };
    }
    const response = await api.post('/media/presigned-url', { fileName, fileType, mediaKind });
    return response.data;
  },

  createGalleryItem: async (itemData) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 200));
      return mockGallery.create(itemData);
    }
    const response = await api.post('/media/gallery', itemData);
    return response.data;
  },

  getGallery: async (page = 1, limit = 24) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 200));
      return mockGallery.getAll(page, limit);
    }
    const response = await api.get('/media/gallery', { params: { page, limit } });
    return response.data;
  },

  deleteGalleryItem: async (id) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      mockGallery.remove(id);
      return { message: 'Deleted' };
    }
    const response = await api.delete(`/media/gallery/${id}`);
    return response.data;
  },

  getAllUsers: async () => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      return mockUsers.getAll();
    }
    const response = await api.get('/users');
    return response.data;
  },

  updateMe: async (updates) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      return mockUsers.updateMe(updates);
    }
    const response = await api.patch('/users/me', updates);
    return response.data;
  },

  deleteProfilePicture: async () => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      return mockUsers.updateMe({ profile_picture: null });
    }
    const response = await api.delete('/users/me/profile-picture');
    return response.data;
  },
};

export default mediaService;
