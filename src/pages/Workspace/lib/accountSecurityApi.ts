import { authFetch, type AuthFetchResponse } from '@lib/apiClient';

export type ReauthPurpose = 'ACCOUNT_DELETE' | string;

type BackendMessageBody = {
  message?: string | null;
  error?: string | null;
};

type WithdrawReauthStatusResponse = {
  purpose?: ReauthPurpose | null;
  verified?: boolean | null;
  verifiedUntil?: string | null;
};

export type WithdrawReauthStatus = {
  purpose: ReauthPurpose;
  verified: boolean;
  verifiedUntil: string | null;
};

type SendWithdrawReauthEmailOtpResponse = {
  purpose?: ReauthPurpose | null;
  otpExpiresAt?: string | null;
  maskedEmail?: string | null;
};

export type SendWithdrawReauthEmailOtpResult = {
  purpose: ReauthPurpose;
  otpExpiresAt: string | null;
  maskedEmail: string;
};

type VerifyWithdrawReauthEmailOtpResponse = {
  purpose?: ReauthPurpose | null;
  verifiedUntil?: string | null;
};

export type VerifyWithdrawReauthEmailOtpResult = {
  purpose: ReauthPurpose;
  verifiedUntil: string | null;
};

export type WithdrawAccountPayload = {
  purpose: ReauthPurpose;
};

const DEFAULT_WITHDRAW_PURPOSE = 'ACCOUNT_DELETE';

function getBackendMessage(res: AuthFetchResponse<BackendMessageBody | unknown>): string | null {
  const data = res.data as BackendMessageBody | null | undefined;
  if (!data) return null;

  if (typeof data.message === 'string' && data.message.trim().length > 0) {
    return data.message;
  }

  if (typeof data.error === 'string' && data.error.trim().length > 0) {
    return data.error;
  }

  return null;
}

export async function fetchWithdrawReauthStatus(
  purpose: ReauthPurpose = DEFAULT_WITHDRAW_PURPOSE,
): Promise<WithdrawReauthStatus> {
  const res = await authFetch<WithdrawReauthStatusResponse | BackendMessageBody>(
    '/api/auth/reauth/status',
    {
      method: 'GET',
      params: { purpose },
    },
  );

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `재인증 상태 조회에 실패했습니다. (status: ${res.status})`);
  }

  const data = res.data as WithdrawReauthStatusResponse;
  return {
    purpose: data?.purpose ?? purpose,
    verified: Boolean(data?.verified),
    verifiedUntil: data?.verifiedUntil ?? null,
  };
}

export async function sendWithdrawReauthEmailOtp(): Promise<SendWithdrawReauthEmailOtpResult> {
  const res = await authFetch<SendWithdrawReauthEmailOtpResponse | BackendMessageBody>(
    '/api/auth/reauth/email/send',
    {
      method: 'POST',
    },
  );

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `인증코드 발송에 실패했습니다. (status: ${res.status})`);
  }

  const data = res.data as SendWithdrawReauthEmailOtpResponse;
  return {
    purpose: data?.purpose ?? DEFAULT_WITHDRAW_PURPOSE,
    otpExpiresAt: data?.otpExpiresAt ?? null,
    maskedEmail: data?.maskedEmail ?? '',
  };
}

export async function verifyWithdrawReauthEmailOtp(
  otp: string,
): Promise<VerifyWithdrawReauthEmailOtpResult> {
  const res = await authFetch<VerifyWithdrawReauthEmailOtpResponse | BackendMessageBody>(
    '/api/auth/reauth/email/verify',
    {
      method: 'POST',
      body: { otp },
    },
  );

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `인증코드 확인에 실패했습니다. (status: ${res.status})`);
  }

  const data = res.data as VerifyWithdrawReauthEmailOtpResponse;
  return {
    purpose: data?.purpose ?? DEFAULT_WITHDRAW_PURPOSE,
    verifiedUntil: data?.verifiedUntil ?? null,
  };
}

export async function withdrawAccount(payload: WithdrawAccountPayload): Promise<void> {
  const res = await authFetch<BackendMessageBody | unknown, WithdrawAccountPayload>(
    '/api/auth/withdraw',
    {
      method: 'POST',
      body: payload,
    },
  );

  if (!res.ok) {
    const backendMessage = getBackendMessage(res);
    throw new Error(backendMessage || `회원탈퇴에 실패했습니다. (status: ${res.status})`);
  }
}
