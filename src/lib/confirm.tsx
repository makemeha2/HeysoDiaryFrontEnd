import * as Dialog from '@radix-ui/react-dialog';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

type ConfirmOptions = {
  variant?: 'default' | 'danger' | 'warning' | 'info';
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

type ErrorOptions = {
  title?: string;
  message?: string;
  actionLabel?: string;
};

type PendingDialog =
  | { type: 'confirm'; options: ConfirmOptions; resolve: (value: boolean) => void }
  | { type: 'error'; options: ErrorOptions; resolve: () => void };

type ConfirmContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  showError: (options: ErrorOptions) => Promise<void>;
};

const ConfirmContext = createContext<ConfirmContextValue | null>(null);
let externalApi: ConfirmContextValue | null = null;

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingDialog | null>(null);

  const close = useCallback(
    (result: boolean) => {
      if (!pending) return;
      if (pending.type === 'confirm') pending.resolve(result);
      else pending.resolve();
      setPending(null);
    },
    [pending],
  );

  const api = useMemo<ConfirmContextValue>(
    () => ({
      confirm: (options) =>
        new Promise<boolean>((resolve) => setPending({ type: 'confirm', options, resolve })),
      showError: (options) =>
        new Promise<void>((resolve) => setPending({ type: 'error', options, resolve })),
    }),
    [],
  );

  externalApi = api;

  const title = pending?.options.title ?? '알림';
  const message = pending?.options.message ?? '';
  const isDanger = pending?.type === 'confirm' && pending.options.variant === 'danger';

  return (
    <ConfirmContext.Provider value={api}>
      {children}
      <Dialog.Root open={!!pending} onOpenChange={(open) => !open && close(false)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-2xl">
            <Dialog.Title className="text-base font-semibold">{title}</Dialog.Title>
            {message ? <Dialog.Description className="mt-2 text-sm leading-6 text-muted-foreground">{message}</Dialog.Description> : null}
            <div className="mt-5 flex justify-end gap-2">
              {pending?.type === 'confirm' ? (
                <Button variant="outline" onClick={() => close(false)}>
                  {pending.options.cancelLabel ?? '취소'}
                </Button>
              ) : null}
              <Button variant={isDanger ? 'danger' : 'default'} onClick={() => close(true)}>
                {pending?.type === 'confirm'
                  ? pending.options.confirmLabel ?? '확인'
                  : pending?.options.actionLabel ?? '확인'}
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const value = useContext(ConfirmContext);
  if (!value) throw new Error('useConfirm must be used within ConfirmProvider');
  return value;
}

export function confirm(options: ConfirmOptions) {
  if (!externalApi) return Promise.resolve(window.confirm(options.message ?? options.title));
  return externalApi.confirm(options);
}

export function showError(options: ErrorOptions) {
  if (!externalApi) {
    window.alert(options.message ?? options.title ?? '오류가 발생했습니다.');
    return Promise.resolve();
  }
  return externalApi.showError(options);
}
