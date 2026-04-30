import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { diffWordsWithSpace } from 'diff';

import useDiaryAiPolish from '@pages/Diary/hooks/useDiaryAiPolish.js';

const modeMap = {
  strict: 'STRICT',
  active: 'RELAXED',
};

const DiffText = ({ original, polished }) => {
  const parts = diffWordsWithSpace(original, polished);
  return (
    <>
      {parts.map((part, index) => {
        if (part.removed) return null;
        if (part.added) {
          return (
            <mark key={index} className="rounded bg-amber/25 px-0.5 text-clay">
              {part.value}
            </mark>
          );
        }
        return <span key={index}>{part.value}</span>;
      })}
    </>
  );
};

const PolishModal = ({ open, onOpenChange, diaryId, content, onApply }) => {
  const {
    polishedContent,
    polishError,
    isPolishing,
    usageText,
    requestPolish,
    resetPolish,
  } = useDiaryAiPolish();
  const [mode, setMode] = useState('strict');
  const tooShort = content.trim().length < 50;

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) resetPolish();
    onOpenChange(nextOpen);
  };

  const handleRequest = () => {
    requestPolish({ diaryId, content, mode: modeMap[mode] });
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/45 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] flex max-h-[90vh] w-[min(96vw,1180px)] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-sand bg-white p-5 shadow-2xl focus:outline-none">
          <div className="flex items-start justify-between border-b border-sand/50 pb-4">
            <div>
              <Dialog.Title className="text-lg font-bold text-clay">글다듬기</Dialog.Title>
              <p className="mt-1 text-xs text-clay/60">{usageText}</p>
            </div>
            <button type="button" aria-label="닫기" onClick={() => handleOpenChange(false)} className="rounded-full p-2 hover:bg-sand/30">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex rounded-full border border-sand bg-linen p-1">
              {[
                ['strict', '엄격'],
                ['active', '적극'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    mode === key ? 'bg-amber text-white' : 'text-clay/70'
                  }`}
                  onClick={() => setMode(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <button
              type="button"
              className="rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={tooShort || isPolishing}
              onClick={handleRequest}
            >
              {isPolishing ? '요청 중' : polishedContent ? '재생성' : '요청'}
            </button>
          </div>

          <div className="mt-4 grid min-h-0 flex-1 gap-4 lg:grid-cols-2">
            <section className="min-h-0 rounded-xl border border-sand/60 bg-linen/60 p-4">
              <h2 className="mb-3 text-sm font-semibold text-clay/70">원문</h2>
              <div className="h-[min(58vh,520px)] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-clay">
                {content || '본문이 없습니다.'}
              </div>
            </section>
            <section className="min-h-0 rounded-xl border border-sand/60 bg-linen/60 p-4">
              <h2 className="mb-3 text-sm font-semibold text-clay/70">결과</h2>
              <div className="h-[min(58vh,520px)] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-clay">
                {polishedContent ? (
                  <DiffText original={content} polished={polishedContent} />
                ) : (
                  <span className="text-clay/55">요청 후 교정본이 표시됩니다.</span>
                )}
              </div>
            </section>
          </div>

          <div className="mt-3 min-h-5 text-xs text-red-600">
            {tooShort ? '글다듬기는 50자 이상부터 요청할 수 있어요.' : polishError}
          </div>

          <div className="mt-4 flex justify-end gap-2 border-t border-sand/50 pt-4">
            <button type="button" className="rounded-full border border-sand px-4 py-2 text-sm font-semibold text-clay" onClick={() => handleOpenChange(false)}>
              취소
            </button>
            <button
              type="button"
              className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              disabled={!polishedContent || isPolishing}
              onClick={() => {
                onApply(polishedContent);
                handleOpenChange(false);
              }}
            >
              적용
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PolishModal;
