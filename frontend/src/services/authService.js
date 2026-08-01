import api from './api.js';
import { mockAuth } from '../utils/mockData.js';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const authService = {
  login: async (masterPassword, username) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 300));
      return mockAuth.login(masterPassword, username);
    }
    const response = await api.post('/auth/login', { masterPassword, username });
    return response.data;
  },

  getMe: async () => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      return mockAuth.getMe();
    }
    const response = await api.get('/users/me');
    return response.data;
  },
};

export default authService;
