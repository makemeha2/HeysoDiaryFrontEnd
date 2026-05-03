import { useEffect, useState } from 'react';
import { Check, HelpCircle, Loader2, RefreshCw, Wand2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import useDiaryAiPolish from '../../hooks/useDiaryAiPolish';

type Props = {
  open: boolean;
  diaryId: number | null;
  source: string;
  onClose: () => void;
  onApply: (content: string) => void;
};

type PolishUiMode = 'strict' | 'active';
type PolishApiMode = 'STRICT' | 'RELAXED';

const MODE_INFO: Record<PolishUiMode, { label: string; description: string; apiMode: PolishApiMode }> = {
  strict: {
    label: '엄격',
    description: '원문의 말투와 표현을 최대한 유지하며, 오탈자·맞춤법·띄어쓰기만 바로잡아요.',
    apiMode: 'STRICT',
  },
  active: {
    label: '적극',
    description: '문체는 유지하되 어색한 표현, 반복, 흐름이 끊기는 부분까지 자연스럽게 다듬어요.',
    apiMode: 'RELAXED',
  },
};

export default function PolishModal({ open, diaryId, source, onClose, onApply }: Props) {
  const [mode, setMode] = useState<PolishUiMode>('strict');
  const [showTooltip, setShowTooltip] = useState<PolishUiMode | null>(null);
  const { polishedContent, polishError, isPolishing, usageText, requestPolish, clearPolishResult } = useDiaryAiPolish();
  const normalizedSource = source.trim();
  const tooShort = normalizedSource.length > 0 && normalizedSource.length < 50;
  const canRequest = normalizedSource.length >= 50 && !isPolishing;
  const hasResult = polishedContent.trim().length > 0;

  useEffect(() => {
    if (!open) return;
    setMode('strict');
    setShowTooltip(null);
    clearPolishResult();
  }, [open]);

  if (!open) return null;

  const handleClose = () => {
    clearPolishResult();
    setShowTooltip(null);
    onClose();
  };

  const handleRequestPolish = () => {
    if (!canRequest) return;
    requestPolish({ diaryId, content: source, mode: MODE_INFO[mode].apiMode });
  };

  const handleApply = () => {
    if (!hasResult || isPolishing) return;
    onApply(polishedContent);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
        onClick={handleClose}
        aria-label="글 다듬기 닫기"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="polish-modal-title"
        className="relative flex h-full w-full flex-col overflow-hidden rounded-none bg-background shadow-2xl md:h-[90vh] md:w-[90vw] md:max-w-6xl md:rounded-xl"
      >
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            <h2 id="polish-modal-title" className="text-base font-semibold text-foreground">
              글 다듬기
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex flex-1 flex-col overflow-hidden md:flex-row">
          <section className="flex flex-1 flex-col overflow-hidden border-b border-border/60 md:border-b-0 md:border-r">
            <div className="flex-shrink-0 border-b border-border/40 px-6 py-3">
              <h3 className="text-sm font-medium text-foreground">원문</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {source ? (
                <p className="whitespace-pre-line text-sm leading-relaxed text-foreground">{source}</p>
              ) : (
                <p className="text-sm italic text-muted-foreground">작성된 내용이 없습니다.</p>
              )}
            </div>
          </section>

          <section className="flex flex-1 flex-col overflow-hidden">
            <div className="flex-shrink-0 border-b border-border/40 px-6 py-3">
              <h3 className="text-sm font-medium text-foreground">AI 교정 결과</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              {!hasResult && !isPolishing && !polishError ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-center text-sm leading-relaxed text-muted-foreground">
                    교정 모드를 선택하고
                    <br />
                    글다듬기 버튼을 눌러주세요.
                  </p>
                </div>
              ) : null}

              {isPolishing ? (
                <div className="flex h-full flex-col items-center justify-center gap-3">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">글을 다듬고 있어요...</p>
                </div>
              ) : null}

              {polishError ? (
                <div className="flex h-full items-center justify-center">
                  <p className="max-w-sm text-center text-sm leading-relaxed text-destructive">{polishError}</p>
                </div>
              ) : null}

              {hasResult ? (
                <p className="whitespace-pre-line font-serif text-sm leading-relaxed text-foreground">{polishedContent}</p>
              ) : null}
            </div>
          </section>
        </div>

        <footer className="flex-shrink-0 border-t border-border/60 px-6 py-4">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs text-muted-foreground">교정 모드:</span>
              <div className="flex gap-2">
                {(Object.keys(MODE_INFO) as PolishUiMode[]).map((item) => (
                  <div key={item} className="relative">
                    <button
                      type="button"
                      onClick={() => setMode(item)}
                      disabled={isPolishing}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                        mode === item
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:text-foreground',
                        isPolishing ? 'cursor-not-allowed opacity-60' : ''
                      )}
                    >
                      {MODE_INFO[item].label}
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          setShowTooltip(showTooltip === item ? null : item);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          event.stopPropagation();
                          setShowTooltip(showTooltip === item ? null : item);
                        }}
                        className="flex h-4 w-4 items-center justify-center"
                        aria-label={`${MODE_INFO[item].label} 설명 보기`}
                      >
                        <HelpCircle className="h-3 w-3 opacity-60" />
                      </span>
                    </button>
                    {showTooltip === item ? (
                      <div className="absolute bottom-full left-0 z-10 mb-2 w-56 rounded-md border border-border bg-popover p-2 shadow-lg">
                        <p className="text-[11px] leading-relaxed text-foreground">{MODE_INFO[item].description}</p>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{usageText}</span>
              {tooShort ? <span className="text-xs text-muted-foreground">50자 이상부터 사용할 수 있어요.</span> : null}
            </div>

            <div className="flex w-full items-center gap-2 md:w-auto">
              {!hasResult ? (
                <button
                  type="button"
                  onClick={handleRequestPolish}
                  disabled={!canRequest}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:flex-none"
                >
                  {isPolishing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      다듬는 중...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      글다듬기
                    </>
                  )}
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleApply}
                    disabled={isPolishing}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 md:flex-none"
                  >
                    <Check className="h-4 w-4" />
                    적용하기
                  </button>
                  <button
                    type="button"
                    onClick={handleRequestPolish}
                    disabled={!canRequest}
                    className="flex items-center justify-center gap-1.5 rounded-md bg-muted px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted/80 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <RefreshCw className="h-4 w-4" />
                    재생성
                  </button>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex items-center justify-center rounded-md px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    취소
                  </button>
                </>
              )}
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}
