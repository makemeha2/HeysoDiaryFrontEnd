import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Check } from 'lucide-react';
import { confirm, showError } from '@/lib/confirm';
import {
  fetchWithdrawReauthStatus,
  sendWithdrawReauthEmailOtp,
  verifyWithdrawReauthEmailOtp,
  withdrawAccount,
} from '../../lib/accountSecurityApi';
import { useAuthStore } from '@stores/authStore.js';

export default function AccountSection({ active }: { active: boolean }) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s: any) => s.clearAuth);
  const [verified, setVerified] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!active) return;
    fetchWithdrawReauthStatus()
      .then((status) => setVerified(status.verified))
      .catch(() => setVerified(false));
  }, [active]);

  const sendOtp = async () => {
    setBusy(true);
    try {
      await sendWithdrawReauthEmailOtp();
      setOtpSent(true);
      await showError({ title: '인증코드 발송', message: '이메일로 4자리 인증코드를 보냈습니다.' });
    } catch (error: any) {
      await showError({ title: '발송 실패', message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const verifyOtp = async () => {
    setBusy(true);
    try {
      await verifyWithdrawReauthEmailOtp(otp);
      setVerified(true);
    } catch (error: any) {
      await showError({ title: '인증 실패', message: error.message });
    } finally {
      setBusy(false);
    }
  };

  const withdraw = async () => {
    const ok = await confirm({
      variant: 'danger',
      title: '계정을 삭제할까요?',
      message: '회원 탈퇴 후에는 계정과 데이터를 복구할 수 없습니다.',
      confirmLabel: '계정 삭제',
    });
    if (!ok) return;
    setBusy(true);
    try {
      await withdrawAccount({ purpose: 'ACCOUNT_DELETE' });
      clearAuth();
      navigate('/', { replace: true });
    } catch (error: any) {
      await showError({ title: '탈퇴 실패', message: error.message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
          <div>
            <h4 className="mb-1 text-sm font-medium text-destructive">회원 탈퇴</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">
              탈퇴 시 모든 일기 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <label className="flex cursor-pointer items-start gap-2">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
            className="mt-1"
          />
          <span className="text-sm text-foreground">위 내용을 확인했으며, 모든 데이터 삭제에 동의합니다.</span>
        </label>

        {verified ? (
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">재인증 완료</span>
          </div>
        ) : null}

        {agreed && !verified && !otpSent ? (
          <button
            type="button"
            onClick={sendOtp}
            disabled={busy}
            className="rounded-md bg-muted px-4 py-2 text-sm text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-50"
          >
            이메일 인증 코드 받기
          </button>
        ) : null}

        {agreed && !verified && otpSent ? (
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="4자리 코드"
              className="w-32 rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none transition-colors focus:border-primary/50"
            />
            <button
              type="button"
              onClick={verifyOtp}
              disabled={busy || otp.length !== 4}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              인증 확인
            </button>
          </div>
        ) : null}

        <button
          type="button"
          onClick={withdraw}
          disabled={busy || !agreed || !verified}
          className="rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          회원 탈퇴
        </button>
      </div>
    </div>
  );
}
