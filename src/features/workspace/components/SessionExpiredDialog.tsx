import * as Dialog from '@radix-ui/react-dialog';
import { googleLogout } from '@react-oauth/google';
import { Button } from '@/components/ui/button';
import { useAuthStore, type AuthStore } from '@stores/authStore';

// 세션이 만료(401)된 사용자에게 다시 로그인할 것을 안내하는 모달.
// - 토큰은 markSessionExpired 시점에 이미 제거되어 있다.
// - "다시 로그인" 클릭 시 모달을 닫으면 Workspace 트리가 IntroPage로 전환된다.
const SessionExpiredDialog = () => {
  const sessionExpired = useAuthStore((s: AuthStore) => s.sessionExpired);
  const dismiss = useAuthStore((s: AuthStore) => s.dismissSessionExpired);

  const handleRelogin = () => {
    // One Tap 자동 재로그인 방지(이전 사용자가 그대로 묶이는 것을 막기 위함).
    try {
      googleLogout();
    } catch {
      // googleLogout은 실패해도 치명적이지 않다.
    }
    dismiss();
  };

  return (
    <Dialog.Root open={sessionExpired} onOpenChange={(open) => !open && dismiss()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[60] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-2xl">
          <Dialog.Title className="text-base font-semibold">세션이 만료되었습니다</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">
            보안을 위해 일정 시간 후 자동으로 로그아웃됩니다. 작성 중이던 내용은 자동 저장되어 있어 다시 로그인하시면 복원할 수 있습니다.
          </Dialog.Description>
          <div className="mt-5 flex justify-end">
            <Button variant="default" onClick={handleRelogin}>
              다시 로그인
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SessionExpiredDialog;
