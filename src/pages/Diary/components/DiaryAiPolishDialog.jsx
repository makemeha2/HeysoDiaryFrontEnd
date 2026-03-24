import * as Dialog from '@radix-ui/react-dialog';
import { SquareX } from 'lucide-react';

const DiaryAiPolishDialog = ({
  open,
  onOpenChange,
  originalContent,
  polishedContent,
  polishError,
  isPolishing,
  canRequestPolish,
  requestButtonLabel,
  isPolishSourceTooShort,
  isPolishSourceTooLong,
  onRequestPolish,
  onApply,
  onCancel,
}) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-[46] flex w-[min(94vw,980px)] max-h-[88vh] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-sand/60 bg-white p-5 shadow-2xl focus:outline-none"
        >
          <div className="flex items-start justify-between gap-3 border-b border-sand/40 pb-3">
            <div className="space-y-1">
              <Dialog.Title className="text-lg font-semibold text-clay">글다듬기</Dialog.Title>
              <p className="text-xs text-clay/60">요청 시 1회 차감됩니다.</p>
            </div>

            <button
              type="button"
              className="text-clay/60 hover:text-clay/80"
              aria-label="Close polish dialog"
              onClick={onCancel}
            >
              <SquareX />
            </button>
          </div>

          <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
            <section className="min-h-0 rounded-2xl border border-sand/60 bg-white/90 p-4">
              <h3 className="mb-2 text-sm font-semibold text-clay/80">원본</h3>
              <textarea
                value={originalContent}
                readOnly
                className="h-[min(48vh,420px)] w-full resize-none overflow-y-auto whitespace-pre-wrap rounded-xl border border-sand/40 bg-sand/10 px-3 py-2 text-sm leading-6 text-clay/90"
              />
            </section>

            <section className="min-h-0 rounded-2xl border border-sand/60 bg-white/90 p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-clay/80">AI 교정본</h3>
                <button
                  type="button"
                  onClick={onRequestPolish}
                  disabled={!canRequestPolish}
                  className="rounded-full border border-sand/70 bg-white px-3.5 py-1.5 text-xs text-clay/80 hover:bg-sand/20 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPolishing ? '요청 중...' : requestButtonLabel}
                </button>
              </div>

              {polishedContent ? (
                <textarea
                  value={polishedContent}
                  readOnly
                  className="h-[min(48vh,420px)] w-full resize-none overflow-y-auto whitespace-pre-wrap rounded-xl border border-sand/40 bg-sand/10 px-3 py-2 text-sm leading-6 text-clay/90"
                />
              ) : (
                <div className="h-[min(48vh,420px)] overflow-y-auto whitespace-pre-wrap rounded-xl border border-dashed border-sand/50 bg-sand/5 px-3 py-3 text-sm text-clay/60">
                  {isPolishing
                    ? 'AI가 글을 다듬는 중입니다...'
                    : '아직 교정본이 없습니다. 상단의 요청 버튼을 눌러주세요.'}
                </div>
              )}
            </section>
          </div>

          <div className="mt-3 space-y-1">
            <p className="text-xs text-clay/60">원본 글자 수: {originalContent.length}자</p>
            {isPolishSourceTooShort && (
              <p className="text-xs text-red-600">글다듬기는 50자 이상부터 요청할 수 있어요.</p>
            )}
            {isPolishSourceTooLong && (
              <p className="text-xs text-red-600">글다듬기는 3000자 이하까지만 지원해요.</p>
            )}
            {polishError && <p className="text-xs text-red-600">{polishError}</p>}
          </div>

          <div className="mt-4 flex items-center justify-end gap-2 border-t border-sand/40 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-full border border-sand/70 px-4 py-2 text-sm text-clay/80 hover:bg-sand/20"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onApply}
              disabled={!polishedContent.trim() || isPolishing}
              className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              적용하기
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DiaryAiPolishDialog;

