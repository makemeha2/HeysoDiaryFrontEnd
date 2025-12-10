import { create } from 'zustand';
import { getAuthData, setAuthData, clearAuthData } from '../lib/apiClient.js';

export const useAuthStore = create((set) => ({
  auth: getAuthData(),

  setAuth: (auth) => {
    setAuthData(auth);
    set({ auth });
  },

  clearAuth: () => {
    clearAuthData();
    set({ auth: null });
  }
}));
