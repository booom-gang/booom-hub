import api from './api.js';
import { mockMessages_svc } from '../utils/mockData.js';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const messageService = {
  getMessages: async (before, limit = 50) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      return mockMessages_svc.getAll(before, limit);
    }
    const params = { limit };
    if (before) params.before = before;
    const response = await api.get('/messages', { params });
    return response.data;
  },
};

export default messageService;
