import * as Dialog from '@radix-ui/react-dialog';

type AdminConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
};

const AdminConfirmDialog = ({
  open,
  onOpenChange,
  title = '확인',
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
}: AdminConfirmDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-clay/80">{description}</Dialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="rounded-md bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
            >
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AdminConfirmDialog;
