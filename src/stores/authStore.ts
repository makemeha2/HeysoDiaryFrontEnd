import { create } from 'zustand';
import {
  authFetch,
  clearAuthData,
  getAuthData,
  setAuthData,
  type AuthData,
  type AuthErrorReason,
} from '@lib/apiClient';

export interface AuthStore {
  auth: AuthData | null;
  authChecked: boolean;
  // 세션 만료가 감지된 시점에 true로 전환된다.
  // UI는 이 값을 구독해 만료 안내 모달을 띄운다.
  sessionExpired: boolean;
  sessionExpiredReason: AuthErrorReason;
  setAuth: (auth: AuthData) => void;
  clearAuth: () => void;
  validateAuth: () => Promise<void>;
  markSessionExpired: (reason?: AuthErrorReason) => void;
  dismissSessionExpired: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  auth: getAuthData(),
  authChecked: false,
  sessionExpired: false,
  sessionExpiredReason: 'unknown',

  // 인증을 받아 auth토큰을 저장하고, 인증체크여부를 true로 변경
  setAuth: (auth: AuthData) => {
    setAuthData(auth);
    set({ auth, authChecked: true, sessionExpired: false, sessionExpiredReason: 'unknown' });
  },

  // 로그아웃시 인증토큰 상태
  clearAuth: () => {
    clearAuthData();
    set({ auth: null, authChecked: true, sessionExpired: false, sessionExpiredReason: 'unknown' });
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
  },

  // 401이 감지되면 호출. 토큰을 즉시 정리해서 후속 요청이 401을 반복하지 않게 한다.
  // auth 자체는 만료 모달이 닫히는 시점에 비우지 않고 즉시 비워 보안적으로 안전한 쪽을 택한다.
  markSessionExpired: (reason = 'unknown') => {
    if (get().sessionExpired) return;
    clearAuthData();
    set({ auth: null, sessionExpired: true, sessionExpiredReason: reason });
  },

  dismissSessionExpired: () => {
    set({ sessionExpired: false, sessionExpiredReason: 'unknown' });
  },
}));
