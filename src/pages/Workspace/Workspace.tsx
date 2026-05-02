import { useEffect, useRef } from 'react';
import IntroPage from './IntroPage';
import WorkspaceLayout from './components/WorkspaceLayout';
// NOTE: JSX 모듈을 import — 타입 추론 제한. 향후 TSX 전환 후보.
import { useAuthStore } from '@stores/authStore.js';

function WorkspaceBootLoading() {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm">
        인증 상태를 확인하고 있습니다.
      </div>
    </div>
  );
}

export default function Workspace() {
  const auth = useAuthStore((s: any) => s.auth);
  const authChecked = useAuthStore((s: any) => s.authChecked);
  const validateAuth = useAuthStore((s: any) => s.validateAuth);
  const validatedRef = useRef(false);

  useEffect(() => {
    if (validatedRef.current) return;
    validatedRef.current = true;
    validateAuth();
  }, [validateAuth]);

  if (!authChecked) return <WorkspaceBootLoading />;
  if (!auth) return <IntroPage />;
  return <WorkspaceLayout />;
}
