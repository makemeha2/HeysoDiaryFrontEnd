import { authFetch } from '@lib/apiClient.js';

export const verifyGoogleWithdrawReauth = async (idToken) => {
  const res = await authFetch('/api/auth/reauth/oauth/google', {
    method: 'POST',
    body: { idToken },
  });

  if (!res.ok) {

    // { "purpose": "WITHDRAW", "verifiedUntil": "2026-03-10T09:59:05.266165500Z" }
    
    const backendMessage =
      typeof res.data?.message === 'string' && res.data.message.trim().length > 0
        ? res.data.message
        : null;
    throw new Error(backendMessage || `재인증 확인에 실패했습니다. (status: ${res.status})`);
  }

  return {
    purpose: res.data?.purpose ?? '',
    verifiedUntil: res.data?.verifiedUntil ?? '',
  };
};
