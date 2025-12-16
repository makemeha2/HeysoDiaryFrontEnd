import { create } from 'zustand';
import { authFetch, clearAuthData, getAuthData, setAuthData } from '../lib/apiClient.js';

export const useAuthStore = create((set, get) => ({
  auth: getAuthData(),
  authChecked: false,

  setAuth: (auth) => {
    setAuthData(auth);
    set({ auth, authChecked: true });
  },

  clearAuth: () => {
    clearAuthData();
    set({ auth: null, authChecked: true });
  },

  validateAuth: async () => {
    const storedAuth = get().auth ?? getAuthData();

    if (!storedAuth) {
      set({ auth: null, authChecked: true });
      return;
    }

    try {
      const result = await authFetch('/api/auth/validate', { method: 'POST' });

      if (result.ok) {
        set({ auth: storedAuth, authChecked: true });
      } else if (result.status === 401) {
        clearAuthData();
        set({ auth: null, authChecked: true });
      } else {
        console.warn('Unexpected auth validation status', result.status);
        clearAuthData();
        set({ auth: null, authChecked: true });
      }
    } catch (err) {
      console.error('Auth validation failed', err);
      clearAuthData();
      set({ auth: null, authChecked: true });
    }
  }
}));
