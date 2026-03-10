import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';

import SectionCard from '@pages/MyPage/components/SectionCard';
import { formatDateTime } from '@lib/dateFormatters.js';
import { verifyGoogleWithdrawReauth } from '@pages/MyPage/api/accountSecurityApi.js';

const AccountSection = ({}) => {
  const [account, setAccount] = useState({
    withdrawAgree: false,
  });
  const [isWithdrawFlowOpened, setIsWithdrawFlowOpened] = useState(false);
  const [isReauthLoading, setIsReauthLoading] = useState(false);
  const [reauthError, setReauthError] = useState('');
  const [reauthInfo, setReauthInfo] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const isWithdrawReady = Boolean(reauthInfo?.verifiedUntil);
  const verifiedUntilText = useMemo(() => formatDateTime(reauthInfo?.verifiedUntil), [reauthInfo]);

  const openWithdrawFlow = useCallback(() => {
    if (!account.withdrawAgree) return;
    setIsWithdrawFlowOpened(true);
    setReauthError('');
  }, [account.withdrawAgree]);

  const handleGoogleReauthSuccess = useCallback(async (credentialResponse) => {
    const idToken = credentialResponse?.credential;

    if (!idToken) {
      setReauthError('Google 재인증 토큰을 가져오지 못했습니다. 다시 시도해주세요.');
      return;
    }

    setIsReauthLoading(true);
    setReauthError('');

    try {
      const result = await verifyGoogleWithdrawReauth(idToken);
      if (!isMountedRef.current) return;
      setReauthInfo(result);
    } catch (error) {
      if (!isMountedRef.current) return;
      const message =
        error?.message || '재인증 요청 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.';
      setReauthError(message);
      setReauthInfo(null);
    } finally {
      if (isMountedRef.current) {
        setIsReauthLoading(false);
      }
    }
  }, []);

  const handleGoogleReauthError = useCallback(() => {
    setReauthError('Google 재인증에 실패했습니다. 계정 선택 후 다시 시도해주세요.');
  }, []);

  const handleFinalWithdraw = useCallback(() => {
    if (!account.withdrawAgree || !isWithdrawReady || isReauthLoading) return;
    console.log('TODO: 회원탈퇴 최종 API 호출', {
      purpose: reauthInfo?.purpose,
      verifiedUntil: reauthInfo?.verifiedUntil,
    });
  }, [account.withdrawAgree, isReauthLoading, isWithdrawReady, reauthInfo]);

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
          disabled={!account.withdrawAgree || isReauthLoading}
          className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
            account.withdrawAgree && !isReauthLoading
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'cursor-not-allowed bg-red-200 text-red-400'
          }`}
        >
          탈퇴 절차 시작
        </button>

        {isWithdrawFlowOpened ? (
          <div className="space-y-3 rounded-xl border border-red-200 bg-white/70 p-4">
            <p className="text-sm text-red-700">Google 계정 재인증이 필요합니다.</p>

            <div className={`${isReauthLoading ? 'pointer-events-none opacity-60' : ''}`}>
              <GoogleLogin onSuccess={handleGoogleReauthSuccess} onError={handleGoogleReauthError} />
            </div>

            {isReauthLoading ? <p className="text-xs text-red-600">재인증 확인 중...</p> : null}

            {reauthError ? (
              <p className="text-xs font-medium text-red-600" role="alert">
                {reauthError}
              </p>
            ) : null}

            {isWithdrawReady ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                <p className="font-semibold">재인증 완료</p>
                <p>인증 유효시간: {verifiedUntilText}</p>
                <p>목적: {reauthInfo?.purpose || '-'}</p>
              </div>
            ) : (
              <p className="text-xs text-red-600">재인증 완료 전에는 최종 탈퇴를 진행할 수 없습니다.</p>
            )}
          </div>
        ) : null}

        <button
          type="button"
          onClick={handleFinalWithdraw}
          disabled={!account.withdrawAgree || !isWithdrawReady || isReauthLoading}
          className={`w-full rounded-full px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 ${
            account.withdrawAgree && isWithdrawReady && !isReauthLoading
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'cursor-not-allowed bg-red-200 text-red-400'
          }`}
        >
          최종 탈퇴
        </button>
      </div>
    </SectionCard>
  );
};

export default AccountSection;
