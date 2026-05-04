import { type ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ConfirmProvider } from '@lib/confirm';

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

export const AppProviders = ({ children }: { children: ReactNode }) => (
  <BrowserRouter>
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ConfirmProvider>
            {children}
          </ConfirmProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  </BrowserRouter>
);
