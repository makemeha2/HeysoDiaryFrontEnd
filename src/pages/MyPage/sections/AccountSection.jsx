import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SectionCard from '@pages/MyPage/components/SectionCard';
import { formatDateTime } from '@lib/dateFormatters.js';
import { useAuthStore } from '@stores/authStore.js';
import {
  fetchWithdrawReauthStatus,
  sendWithdrawReauthEmailOtp,
  verifyWithdrawReauthEmailOtp,
  withdrawAccount,
} from '@pages/MyPage/api/accountSecurityApi.js';

const AccountSection = () => {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const [account, setAccount] = useState({
    withdrawAgree: false,
  });

  const [isWithdrawFlowOpened, setIsWithdrawFlowOpened] = useState(false);
  const [reauthStatusLoading, setReauthStatusLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedUntil, setVerifiedUntil] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [otpExpiresAt, setOtpExpiresAt] = useState(null);
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const verifiedUntilText = useMemo(() => formatDateTime(verifiedUntil), [verifiedUntil]);
  const otpExpiresAtText = useMemo(() => formatDateTime(otpExpiresAt), [otpExpiresAt]);

  const loadReauthStatus = useCallback(async () => {
    setReauthStatusLoading(true);

    try {
      const result = await fetchWithdrawReauthStatus('ACCOUNT_DELETE');
      setIsVerified(Boolean(result.verified));
      setVerifiedUntil(result.verifiedUntil ?? null);
      if (result.verified) {
        setShowOtpInput(false);
      }
    } catch (error) {
      const message =
        error?.message || '재인증 상태를 확인하지 못했습니다. 잠시 후 다시 시도해주세요.';
      setErrorMessage(message);
    } finally {
      setReauthStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReauthStatus();
  }, [loadReauthStatus]);

  const isWithdrawReady = account.withdrawAgree && isVerified;

  const openWithdrawFlow = useCallback(() => {
    if (!account.withdrawAgree) return;
    setIsWithdrawFlowOpened(true);
    setErrorMessage('');
    setSuccessMessage('');
  }, [account.withdrawAgree]);

  const handleSendOtp = useCallback(async () => {
    if (isSendingOtp || isVerifyingOtp || isWithdrawing) return;

    setIsSendingOtp(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await sendWithdrawReauthEmailOtp();
      setMaskedEmail(result.maskedEmail ?? '');
      setOtpExpiresAt(result.otpExpiresAt ?? null);
      setShowOtpInput(true);
      setSuccessMessage('인증코드가 발송되었습니다. 이메일에서 4자리 코드를 확인해주세요.');
    } catch (error) {
      const message = error?.message || '인증코드 발송에 실패했습니다. 다시 시도해주세요.';
      setErrorMessage(message);
    } finally {
      setIsSendingOtp(false);
    }
  }, [isSendingOtp, isVerifyingOtp, isWithdrawing]);

  const handleOtpChange = useCallback((event) => {
    const digitsOnly = event.target.value.replace(/\D/g, '').slice(0, 4);
    setOtp(digitsOnly);
  }, []);

  const handleVerifyOtp = useCallback(async () => {
    if (isVerifyingOtp || isSendingOtp || isWithdrawing) return;

    if (!/^\d{4}$/.test(otp)) {
      setErrorMessage('인증코드는 4자리 숫자로 입력해주세요.');
      return;
    }

    setIsVerifyingOtp(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const result = await verifyWithdrawReauthEmailOtp(otp);
      setIsVerified(true);
      setVerifiedUntil(result.verifiedUntil ?? null);
      setShowOtpInput(false);
      setSuccessMessage('재인증이 완료되었습니다. 이제 최종 탈퇴를 진행할 수 있습니다.');
    } catch (error) {
      const message =
        error?.message || '인증코드 검증에 실패했습니다. 인증코드를 확인하고 다시 시도해주세요.';
      setErrorMessage(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  }, [isSendingOtp, isVerifyingOtp, isWithdrawing, otp]);

  const handleFinalWithdraw = useCallback(async () => {
    if (isWithdrawing || isVerifyingOtp || isSendingOtp) return;
    if (!isWithdrawReady) {
      setErrorMessage('재인증이 완료되어야 최종 탈퇴를 진행할 수 있습니다.');
      return;
    }

    setIsWithdrawing(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await withdrawAccount({ reasonCode: 'USER_REQUEST' });
      clearAuth();
      window.alert('회원탈퇴가 완료되었습니다.');
      navigate('/login', { replace: true });
    } catch (error) {
      const message =
        error?.message || '회원탈퇴에 실패했습니다. 재인증이 만료되었는지 확인 후 다시 시도해주세요.';
      setErrorMessage(message);
    } finally {
      setIsWithdrawing(false);
    }
  }, [clearAuth, isSendingOtp, isVerifyingOtp, isWithdrawReady, isWithdrawing, navigate]);

  const isBusy = reauthStatusLoading || isSendingOtp || isVerifyingOtp || isWithdrawing;

  return (
    <SectionCard title="회원탈퇴" description="탈퇴 시 데이터가 영구적으로 삭제됩니다.">
      <div className="space-y-4 rounded-2xl border border-red-300 bg-red-50 p-5">
        <p className="text-sm text-red-700">
          탈퇴하면 복구가 불가능합니다. 중요한 데이터는 미리 내보내기 해주세요.
        </p>
        <label className="flex items-center gap-2 text-sm text-red-700">
          <input
            type="checkbox"
            checked={account.withdrawAgree}
            onChange={(event) =>
              setAccount((prev) => ({
                ...prev,
                withdrawAgree: event.target.checked,
              }))
            }
            className="h-4 w-4 rounded border-red-300 text-red-500 focus:ring-red-400"
          />
          모든 내용을 확인했고, 탈퇴에 동의합니다.
        </label>
        <button
          type="button"
          onClick={openWithdrawFlow}
          disabled={!account.withdrawAgree || isBusy}
          className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
            account.withdrawAgree && !isBusy
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'cursor-not-allowed bg-red-200 text-red-400'
          }`}
        >
          탈퇴 절차 시작
        </button>

        {isWithdrawFlowOpened ? (
          <div className="space-y-3 rounded-xl border border-red-200 bg-white/70 p-4">
            <p className="text-sm text-red-700">탈퇴 전 이메일 OTP 재인증이 필요합니다.</p>

            {reauthStatusLoading ? (
              <p className="text-xs text-red-600">재인증 상태를 확인 중입니다...</p>
            ) : null}

            {verifiedUntil ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                <p className="font-semibold">현재 재인증 상태: {isVerified ? '완료' : '미완료'}</p>
                <p>인증 유효시간: {verifiedUntilText}</p>
              </div>
            ) : null}

            {!isVerified ? (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={isSendingOtp || isVerifyingOtp || isWithdrawing}
                  className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                    isSendingOtp || isVerifyingOtp || isWithdrawing
                      ? 'cursor-not-allowed bg-red-200 text-red-400'
                      : 'bg-red-500 text-white hover:bg-red-600'
                  }`}
                >
                  {isSendingOtp ? '인증코드 발송 중...' : showOtpInput ? '인증코드 재발송' : '인증코드 발송'}
                </button>

                {maskedEmail ? (
                  <p className="text-xs text-red-700">발송 대상: {maskedEmail}</p>
                ) : null}

                {otpExpiresAt ? (
                  <p className="text-xs text-red-700">코드 만료시간: {otpExpiresAtText}</p>
                ) : null}

                {showOtpInput ? (
                  <div className="space-y-2 rounded-lg border border-red-200 bg-red-50/60 p-3">
                    <label className="block text-xs font-medium text-red-700" htmlFor="withdraw-otp">
                      인증코드(4자리)
                    </label>
                    <input
                      id="withdraw-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otp}
                      onChange={handleOtpChange}
                      placeholder="0000"
                      maxLength={4}
                      className="w-full rounded-lg border border-red-200 bg-white px-3 py-2 text-sm text-red-800 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-200"
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={isVerifyingOtp || isSendingOtp || isWithdrawing}
                      className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
                        isVerifyingOtp || isSendingOtp || isWithdrawing
                          ? 'cursor-not-allowed bg-red-200 text-red-400'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {isVerifyingOtp ? '인증코드 확인 중...' : '인증코드 확인'}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                <p className="font-semibold">재인증 완료</p>
                <p>인증 유효시간: {verifiedUntilText}</p>
              </div>
            )}

            {successMessage ? (
              <p className="text-xs font-medium text-emerald-700" role="status">
                {successMessage}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {errorMessage}
              </p>
            ) : null}

            <div className="text-xs text-red-600">
              <p>재인증이 완료되어야 최종 탈퇴를 진행할 수 있습니다.</p>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleFinalWithdraw}
          disabled={!isWithdrawReady || isWithdrawing || isVerifyingOtp || isSendingOtp}
          className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
            isWithdrawReady && !isWithdrawing && !isVerifyingOtp && !isSendingOtp
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'cursor-not-allowed bg-red-200 text-red-400'
          }`}
        >
          {isWithdrawing ? '탈퇴 처리 중...' : '최종 탈퇴'}
        </button>
      </div>
    </SectionCard>
  );
};

export default AccountSection;
