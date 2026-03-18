import { authFetch } from '@lib/apiClient.js';

const getBackendMessage = (res) => {
  if (!res?.data) return null;

  if (typeof res.data?.message === 'string' && res.data.message.trim().length > 0) {
    return res.data.message;
  }

  if (typeof res.data?.error === 'string' && res.data.error.trim().length > 0) {
    return res.data.error;
  }

  return null;
};

export const fetchWithdrawReauthStatus = async (purpose = 'ACCOUNT_DELETE') => {
  const res = await authFetch('/api/auth/reauth/status', {
    method: 'GET',
    params: { purpose },
  });

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `재인증 상태 조회에 실패했습니다. (status: ${res.status})`);
  }

  return {
    purpose: res.data?.purpose ?? purpose,
    verified: Boolean(res.data?.verified),
    verifiedUntil: res.data?.verifiedUntil ?? null,
  };
};

export const sendWithdrawReauthEmailOtp = async () => {
  const res = await authFetch('/api/auth/reauth/email/send', {
    method: 'POST',
  });

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `인증코드 발송에 실패했습니다. (status: ${res.status})`);
  }

  return {
    purpose: res.data?.purpose ?? 'ACCOUNT_DELETE',
    otpExpiresAt: res.data?.otpExpiresAt ?? null,
    maskedEmail: res.data?.maskedEmail ?? '',
  };
};

export const verifyWithdrawReauthEmailOtp = async (otp) => {
  const res = await authFetch('/api/auth/reauth/email/verify', {
    method: 'POST',
    body: { otp },
  });

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `인증코드 확인에 실패했습니다. (status: ${res.status})`);
  }

  return {
    purpose: res.data?.purpose ?? 'ACCOUNT_DELETE',
    verifiedUntil: res.data?.verifiedUntil ?? null,
  };
};

export const withdrawAccount = async (payload) => {
  const res = await authFetch('/api/auth/withdraw', {
    method: 'POST',
    body: payload,
  });

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `회원탈퇴에 실패했습니다. (status: ${res.status})`);
  }
};
