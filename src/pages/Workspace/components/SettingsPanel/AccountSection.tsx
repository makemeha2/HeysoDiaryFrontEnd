import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { confirm, showError } from '@/lib/confirm';
import {
  fetchWithdrawReauthStatus,
  sendWithdrawReauthEmailOtp,
  verifyWithdrawReauthEmailOtp,
  withdrawAccount,
} from '../../lib/accountSecurityApi';
// NOTE: JSX 모듈을 import — 타입 추론 제한. 향후 TSX 전환 후보.
import { useAuthStore } from '@stores/authStore.js';

export default function AccountSection({ active }: { active: boolean }) {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((s: any) => s.clearAuth);
  const [verified, setVerified] = useState(false);
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!active) return;
    fetchWithdrawReauthStatus().then((status) => setVerified(status.verified)).catch(() => setVerified(false));
  }, [active]);

  const sendOtp = async () => {
    setBusy(true);
    try {
      await sendWithdrawReauthEmailOtp();
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
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-muted p-3 text-sm text-muted-foreground">
        재인증 상태: {verified ? '완료' : '필요'}
      </div>
      {!verified ? (
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" disabled={busy} onClick={sendOtp}>인증코드 발송</Button>
          <Input className="w-28" inputMode="numeric" maxLength={4} value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))} />
          <Button disabled={busy || otp.length !== 4} onClick={verifyOtp}>확인</Button>
        </div>
      ) : null}
      <Button variant="danger" disabled={busy || !verified} onClick={withdraw}>계정 삭제</Button>
    </div>
  );
}
