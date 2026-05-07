import { useNavigate } from 'react-router-dom';
import { googleLogout } from '@react-oauth/google';
import { confirm } from '@/lib/confirm';
import { authFetch } from '@lib/apiClient';
import { useAuthStore, type AuthStore } from '@stores/authStore';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s: AuthStore) => s.clearAuth);

  const logout = async () => {
    const ok = await confirm({
      title: '로그아웃',
      message: '현재 계정에서 로그아웃하시겠습니까?',
      confirmLabel: '로그아웃',
    });
    if (!ok) return;
    try {
      await authFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // 서버 로그아웃 실패와 무관하게 로컬 세션은 정리한다.
    }
    try {
      googleLogout();
    } catch {
      // googleLogout 실패는 치명적이지 않다.
    }
    clearAuth();
    navigate('/', { replace: true });
  };

  return { logout };
}
