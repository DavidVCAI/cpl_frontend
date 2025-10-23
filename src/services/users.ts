import api from './api';
import type { User, UserRegisterData } from '../types';

export const usersService = {
  // Register a new user
  register: async (data: UserRegisterData): Promise<User> => {
    const response = await api.post('/api/users/register', data);
    return response.data;
  },

  // Login user by phone
  login: async (phone: string): Promise<User> => {
    const response = await api.post('/api/users/login', { phone, name: '' });
    return response.data;
  },

  // Get user by ID
  getUser: async (userId: string): Promise<User> => {
    const response = await api.get(`/api/users/${userId}`);
    return response.data;
  },

  // Get user's collectibles
  getUserCollectibles: async (userId: string) => {
    const response = await api.get(`/api/users/${userId}/collectibles`);
    return response.data;
  },
};
