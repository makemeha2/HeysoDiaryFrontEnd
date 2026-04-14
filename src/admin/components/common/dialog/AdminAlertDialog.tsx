import * as Dialog from '@radix-ui/react-dialog';

type AdminAlertDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

const AdminAlertDialog = ({
  open,
  onOpenChange,
  title = '알림',
  description,
  actionLabel = '확인',
  onAction,
}: AdminAlertDialogProps) => {
  const handleAction = () => {
    onAction?.();
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-clay/80">{description}</Dialog.Description>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleAction}
              className="rounded-md bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
            >
              {actionLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default AdminAlertDialog;
