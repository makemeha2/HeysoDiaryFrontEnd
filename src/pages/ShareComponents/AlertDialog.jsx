import { useCallback, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';

const AlertDialog = ({
  open,
  onOpenChange,
  title = '알림',
  description = '',
  actionLabel = '확인',
  onAction,
  closeOnEsc = true, // ✅ 옵션: ESC로 닫기(=확인 처리)
  closeOnEnter = true, // ✅ 옵션: Enter로 확인
}) => {
  const actionBtnRef = useRef(null);
  const hasFiredAction = useRef(false);

  useEffect(() => {
    if (open) hasFiredAction.current = false;
  }, [open]);

  const runActionAndClose = useCallback(() => {
    if (hasFiredAction.current) return;
    hasFiredAction.current = true;

    onAction?.(); // ✅ "확인" 의미
    onOpenChange?.(false); // ✅ 닫기
  }, [onAction, onOpenChange]);

  const handleKeyDownCapture = useCallback(
    (e) => {
      if (closeOnEnter && e.key === 'Enter') {
        e.preventDefault();
        runActionAndClose();
      }

      if (closeOnEsc && e.key === 'Escape') {
        e.preventDefault();
        runActionAndClose();
      }
    },
    [closeOnEnter, closeOnEsc, runActionAndClose],
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onKeyDownCapture={handleKeyDownCapture}
          onOpenAutoFocus={(e) => {
            // ✅ 열릴 때 "확인" 버튼에 포커스
            e.preventDefault();
            actionBtnRef.current?.focus();
          }}
          className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/60 bg-white/90 p-6 shadow-xl"
        >
          <Dialog.Title className="text-lg font-semibold text-clay">{title}</Dialog.Title>

          {description && (
            <Dialog.Description className="mt-2 text-sm text-clay/70 whitespace-pre-line">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-6 flex justify-end">
            <button
              ref={actionBtnRef}
              type="button"
              onClick={runActionAndClose}
              className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90"
            >
              {actionLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AlertDialog;
