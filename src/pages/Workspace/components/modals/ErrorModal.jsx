import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Copy, RotateCcw, X, XCircle } from 'lucide-react';

const ErrorModal = ({ open, title = '오류가 발생했습니다', message, errorCode, details, onClose, onRetry }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={(nextOpen) => !nextOpen && onClose?.()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[min(92vw,520px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand bg-white p-5 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between gap-3">
            <XCircle className="h-6 w-6 text-red-600" />
            <button type="button" className="rounded-full p-1 hover:bg-sand/30" aria-label="닫기" onClick={onClose}>
              <X className="h-4 w-4" />
            </button>
          </div>
          <Dialog.Title className="mt-4 text-lg font-bold text-clay">{title}</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-6 text-clay/70">{message}</Dialog.Description>
          {errorCode && <p className="mt-2 text-xs text-clay/45">Code: {errorCode}</p>}
          {details && (
            <div className="mt-4">
              <button type="button" className="text-xs font-semibold text-amber" onClick={() => setShowDetails((prev) => !prev)}>
                상세 {showDetails ? '닫기' : '보기'}
              </button>
              {showDetails && <pre className="mt-2 max-h-44 overflow-auto rounded-xl bg-linen p-3 text-xs text-clay/70">{details}</pre>}
            </div>
          )}
          <div className="mt-6 flex justify-end gap-2">
            {details && (
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-clay" onClick={() => navigator.clipboard?.writeText(details)}>
                <Copy className="h-4 w-4" />
                복사
              </button>
            )}
            {onRetry && (
              <button type="button" className="inline-flex items-center gap-2 rounded-full border border-sand px-4 py-2 text-sm font-semibold text-clay" onClick={onRetry}>
                <RotateCcw className="h-4 w-4" />
                재시도
              </button>
            )}
            <button type="button" className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white" onClick={onClose}>
              확인
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ErrorModal;
