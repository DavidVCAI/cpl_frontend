import api from './api';
import type { Event, EventCreateData } from '../types';

export const eventsService = {
  // Create a new event
  createEvent: async (data: EventCreateData, creatorId: string): Promise<any> => {
    const response = await api.post('/api/events', { ...data, creator_id: creatorId });
    return response.data;
  },

  // Get nearby events
  getNearbyEvents: async (lng: number, lat: number, maxDistance: number = 5000): Promise<Event[]> => {
    const response = await api.get('/api/events/nearby', {
      params: { lng, lat, max_distance: maxDistance },
    });
    return response.data;
  },

  // Get event by ID
  getEvent: async (eventId: string): Promise<Event> => {
    const response = await api.get(`/api/events/${eventId}`);
    return response.data;
  },

  // Join an event
  joinEvent: async (eventId: string, userId: string): Promise<any> => {
    const response = await api.post(`/api/events/${eventId}/join?user_id=${userId}`);
    return response.data;
  },

  // End an event
  endEvent: async (eventId: string, creatorId: string): Promise<any> => {
    const response = await api.post(`/api/events/${eventId}/end?creator_id=${creatorId}`);
    return response.data;
  },
};
