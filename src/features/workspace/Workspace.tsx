import { useEffect, useRef } from 'react';
import IntroPage from './IntroPage';
import WorkspaceLayout from './components/WorkspaceLayout';
import SessionExpiredDialog from './components/SessionExpiredDialog';
import { useAuthStore, type AuthStore } from '@stores/authStore';
import { registerSessionExpiredHandler } from '@lib/apiClient';

const WorkspaceBootLoading = () => {
  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm shadow-sm">
        인증 상태를 확인하고 있습니다.
      </div>
    </div>
  );
};

const Workspace = () => {
  const auth = useAuthStore((s: AuthStore) => s.auth);
  const authChecked = useAuthStore((s: AuthStore) => s.authChecked);
  const validateAuth = useAuthStore((s: AuthStore) => s.validateAuth);
  const markSessionExpired = useAuthStore((s: AuthStore) => s.markSessionExpired);
  const validatedRef = useRef(false);

  useEffect(() => {
    if (validatedRef.current) return;
    validatedRef.current = true;
    validateAuth();
  }, [validateAuth]);

  // apiClient의 401 핸들러를 store 액션과 연결한다.
  useEffect(() => {
    registerSessionExpiredHandler(({ authError }) => markSessionExpired(authError));
    return () => registerSessionExpiredHandler(null);
  }, [markSessionExpired]);

  if (!authChecked) return <WorkspaceBootLoading />;
  return (
    <>
      {auth ? <WorkspaceLayout /> : <IntroPage />}
      <SessionExpiredDialog />
    </>
  );
};

export default Workspace;
