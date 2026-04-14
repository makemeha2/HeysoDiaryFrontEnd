import * as Dialog from '@radix-ui/react-dialog';

type TemplatePreviewDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  previewVars: string;
  setPreviewVars: React.Dispatch<React.SetStateAction<string>>;
  previewResult: string | null;
  previewError: string | null;
  onPreview: () => Promise<void>;
};

const TemplatePreviewDialog = ({
  open,
  onOpenChange,
  previewVars,
  setPreviewVars,
  previewResult,
  previewError,
  onPreview,
}: TemplatePreviewDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">템플릿 미리보기</Dialog.Title>

          <div className="mt-4 flex flex-col gap-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-clay/80">변수 (JSON)</span>
              <textarea
                value={previewVars}
                onChange={(e) => setPreviewVars(e.target.value)}
                className="rounded border border-sand px-3 py-2 text-xs font-mono"
                rows={3}
                placeholder={'{"diary_date": "2026-04-09", "title": "테스트"}'}
              />
            </label>

            <button
              type="button"
              onClick={onPreview}
              className="self-start rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
            >
              렌더링
            </button>

            {previewError && (
              <div className="rounded border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay">
                {previewError}
              </div>
            )}

            {previewResult != null && (
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-clay/70">렌더링 결과</span>
                <pre className="max-h-64 overflow-auto rounded border border-sand/60 bg-linen p-3 text-xs text-clay whitespace-pre-wrap break-all">
                  {previewResult}
                </pre>
              </div>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
            >
              닫기
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TemplatePreviewDialog;
