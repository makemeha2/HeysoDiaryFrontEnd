import * as Dialog from '@radix-ui/react-dialog';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

const variants = {
  default: { icon: CheckCircle2, button: 'bg-amber text-white', iconClass: 'text-amber' },
  danger: { icon: AlertTriangle, button: 'bg-red-600 text-white', iconClass: 'text-red-600' },
  warning: { icon: AlertTriangle, button: 'bg-amber text-white', iconClass: 'text-amber' },
  info: { icon: Info, button: 'bg-moss text-white', iconClass: 'text-moss' },
};

const ConfirmModal = ({
  open,
  variant = 'default',
  title,
  message,
  confirmLabel = '확인',
  cancelLabel = '취소',
  onConfirm,
  onCancel,
}) => {
  const style = variants[variant] ?? variants.default;
  const Icon = style.icon;

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onCancel?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand bg-white p-5 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-3">
            <Icon className={`mt-1 h-5 w-5 ${style.iconClass}`} />
            <button type="button" className="rounded-full p-1 hover:bg-sand/30" aria-label="닫기" onClick={onCancel}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <Dialog.Title className="mt-4 text-lg font-bold text-clay">{title}</Dialog.Title>
          {message && <Dialog.Description className="mt-2 text-sm leading-6 text-clay/70">{message}</Dialog.Description>}
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-clay" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className={`rounded-full px-5 py-2 text-sm font-semibold ${style.button}`} onClick={onConfirm}>
              {confirmLabel}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ConfirmModal;

