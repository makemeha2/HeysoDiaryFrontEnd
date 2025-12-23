import { create } from 'zustand';
import { authFetch, clearAuthData, getAuthData, setAuthData } from '../lib/apiClient.js';

export const useAuthStore = create((set, get) => ({
  auth: getAuthData(),
  authChecked: false,

  // 인증을 받아 auth토큰을 저장하고, 인증체크여부를 true로 변경
  setAuth: (auth) => {
    setAuthData(auth);
    set({ auth, authChecked: true });
  },

  // 로그아웃시 인증토큰 상태
  clearAuth: () => {
    clearAuthData();
    set({ auth: null, authChecked: true });
  },

  // browser나 store에 남아있는 토큰이 유효한 토큰인지 서버 체크
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
