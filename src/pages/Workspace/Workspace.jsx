import { useEffect, useRef } from 'react';

import { useAuthStore } from '@stores/authStore.js';

import IntroPage from './IntroPage.jsx';
import WorkspaceLayout from './components/WorkspaceLayout.jsx';

const Workspace = () => {
  const auth = useAuthStore((state) => state.auth);
  const authChecked = useAuthStore((state) => state.authChecked);
  const validateAuth = useAuthStore((state) => state.validateAuth);
  const validatedRef = useRef(false);

  useEffect(() => {
    if (validatedRef.current) return;
    validatedRef.current = true;
    validateAuth();
  }, [validateAuth]);

  if (!authChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-linen text-sm text-clay/70">
        인증 상태를 확인하고 있어요.
      </div>
    );
  }

  return auth ? <WorkspaceLayout /> : <IntroPage />;
};

export default Workspace;

