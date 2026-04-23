import * as Dialog from '@radix-ui/react-dialog';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Info, SquareX } from 'lucide-react';
import { diffWordsWithSpace } from 'diff';

const MODE_OPTIONS = [
  {
    value: 'STRICT',
    label: '엄격',
    tooltip: '원문의 말투와 표현을 최대한 유지하며, 오탈자·맞춤법·띄어쓰기만 바로잡아요.',
  },
  {
    value: 'RELAXED',
    label: '적극',
    tooltip: '문체는 유지하되 어색한 표현, 반복, 흐름이 끊기는 부분까지 자연스럽게 다듬어요.',
  },
];

const DiffHighlight = ({ original, polished }) => {
  const parts = diffWordsWithSpace(original, polished);
  return (
    <>
      {parts.map((part, index) => {
        if (part.removed) return null;
        if (part.added) {
          return (
            <mark key={index} className="bg-yellow-200/80 text-clay px-0.5 rounded-sm">
              {part.value}
            </mark>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
};

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
  polishMode,
  onModeChange,
  onRequestPolish,
  onApply,
  onCancel,
}) => {
  return (
    <Tooltip.Provider delayDuration={300}>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[45] bg-black/50 backdrop-blur-sm data-[state=open]:animate-fadeIn" />
          <Dialog.Content
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            className="fixed left-1/2 top-1/2 z-[46] flex w-[min(96vw,1280px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-sand/60 bg-white p-5 shadow-2xl focus:outline-none"
          >
            <div className="flex items-start justify-between gap-3 border-b border-sand/40 pb-3">
              <div className="space-y-1">
                <Dialog.Title className="text-lg font-semibold text-clay">글다듬기</Dialog.Title>
                <p className="text-xs text-clay/60">하루 3회로 제한되며, 요청 시 1회 차감됩니다.</p>
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
                <div className="mb-1.5 flex min-h-[2.5rem] items-start">
                  <h3 className="text-sm font-semibold text-clay/80">원본</h3>
                </div>
                <textarea
                  value={originalContent}
                  readOnly
                  className="h-[min(60vh,520px)] w-full resize-none overflow-y-auto whitespace-pre-wrap rounded-xl border border-sand/40 bg-sand/10 px-3 py-2 text-sm leading-6 text-clay/90"
                />
              </section>

              <section className="min-h-0 rounded-2xl border border-sand/60 bg-white/90 p-4">
                <div className="mb-1.5 flex min-h-[2.5rem] flex-wrap items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold text-clay/80">AI 교정본</h3>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-clay/60">교정 모드</span>
                      <Tooltip.Root>
                        <Tooltip.Trigger asChild>
                          <button
                            type="button"
                            className="text-clay/40 hover:text-clay/70 focus:outline-none"
                            aria-label="교정 모드 설명"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </button>
                        </Tooltip.Trigger>
                        <Tooltip.Portal>
                          <Tooltip.Content
                            side="bottom"
                            sideOffset={6}
                            className="z-[50] max-w-[260px] rounded-lg bg-clay px-3 py-2 text-xs leading-5 text-white shadow"
                          >
                            <div className="space-y-2">
                              <p>
                                <span className="font-semibold">엄격</span>: 원문의 말투와 표현을
                                최대한 유지하며, 오탈자·맞춤법·띄어쓰기만 바로잡아요.
                              </p>
                              <p>
                                <span className="font-semibold">적극</span>: 문체는 유지하되 어색한
                                표현, 반복, 흐름이 끊기는 부분까지 자연스럽게 다듬어요.
                              </p>
                            </div>
                            <Tooltip.Arrow className="fill-clay" />
                          </Tooltip.Content>
                        </Tooltip.Portal>
                      </Tooltip.Root>
                    </div>

                    <div className="flex items-center gap-1">
                      {MODE_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={polishMode === option.value}
                          onClick={() => onModeChange(option.value)}
                          className={`rounded-full border px-3.5 py-1 text-xs font-medium transition-colors ${
                            polishMode === option.value
                              ? 'border-amber bg-amber text-white'
                              : 'border-sand/70 bg-white text-clay/70 hover:bg-sand/20'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={onRequestPolish}
                      disabled={!canRequestPolish}
                      className="rounded-full border border-sand/70 bg-white px-3.5 py-1.5 text-xs text-clay/80 hover:bg-sand/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isPolishing ? '요청 중...' : requestButtonLabel}
                    </button>
                  </div>
                </div>

                {polishedContent ? (
                  <div
                    role="region"
                    aria-label="AI 교정본"
                    className="h-[min(60vh,520px)] select-text overflow-y-auto whitespace-pre-wrap rounded-xl border border-sand/40 bg-sand/10 px-3 py-2 text-sm leading-6 text-clay/90"
                  >
                    <DiffHighlight original={originalContent} polished={polishedContent} />
                  </div>
                ) : (
                  <div className="h-[min(60vh,520px)] overflow-y-auto whitespace-pre-wrap rounded-xl border border-dashed border-sand/50 bg-sand/5 px-3 py-3 text-sm text-clay/60">
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
    </Tooltip.Provider>
  );
};

export default DiaryAiPolishDialog;
