import * as Dialog from '@radix-ui/react-dialog';

const ConfirmDialog = ({
  open,
  onOpenChange,
  title = '확인',
  description = '',
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* 배경 오버레이 */}
        <Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm" />

        {/* 모달 컨텐츠 */}
        <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/60 bg-white/90 p-6 shadow-xl">
          <Dialog.Title className="text-lg font-semibold text-clay">{title}</Dialog.Title>
          {description && (
            <Dialog.Description className="mt-2 text-sm text-clay/70 whitespace-pre-line">
              {description}
            </Dialog.Description>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-sand/70 px-4 py-2 text-sm text-clay/80 hover:bg-sand/20"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90"
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmDialog;
