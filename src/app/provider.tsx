import { useEffect, type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ConfirmProvider } from '@lib/confirm';
import { useThemeStore } from '@stores/themeStore';

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const getErrorStatus = (error: Error): number | null =>
  typeof (error as Error & { status?: unknown }).status === 'number'
    ? (error as Error & { status: number }).status
    : null;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        const status = getErrorStatus(error);
        if (status !== null && status < 500) return false;
        return failureCount < 2;
      },
    },
  },
});

// theme 변경 시 document 루트에 data-theme 속성 동기화
// Provider 트리 밖에서 단 1회 구독 — 불필요한 리렌더 없이 DOM만 갱신
const ThemeApplier = () => {
  const theme = useThemeStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
  return null;
};

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <GoogleOAuthProvider clientId={clientId ?? ''}>
      <QueryClientProvider client={queryClient}>
        <ThemeApplier />
        <ConfirmProvider>
          {children}
        </ConfirmProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
