import api from './api.js';
import { mockEvents } from '../utils/mockData.js';

const useMocks = import.meta.env.VITE_USE_MOCKS === 'true';

const eventService = {
  getEvents: async (month, year) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 150));
      return mockEvents.getAll(month, year);
    }
    const response = await api.get('/events', { params: { month, year } });
    return response.data;
  },

  createEvent: async (eventData) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 200));
      return mockEvents.create(eventData);
    }
    const response = await api.post('/events', eventData);
    return response.data;
  },

  updateEvent: async (id, eventData) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 150));
      return mockEvents.update(id, eventData);
    }
    const response = await api.patch(`/events/${id}`, eventData);
    return response.data;
  },

  deleteEvent: async (id) => {
    if (useMocks) {
      await new Promise((r) => setTimeout(r, 100));
      mockEvents.remove(id);
      return { message: 'Deleted' };
    }
    const response = await api.delete(`/events/${id}`);
    return response.data;
  },
};

export default eventService;
