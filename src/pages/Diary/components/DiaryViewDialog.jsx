import { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { SquareX } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import markdownItIns from 'markdown-it-ins';
import { formatDateTime, formatDateWithWeekday } from '@lib/dateFormatters.js';
import useDiary from '../useDiary.jsx';
import DiaryAiCommentSection from './DiaryAiCommentSection.jsx';
import { normalizeTags } from '../diaryUtil.js';

const mdParser = new MarkdownIt({
  breaks: true,
});
mdParser.use(markdownItIns);

const DiaryViewDialog = ({ diaryId, onClose, onEdit }) => {
  const { diaryDetailQuery } = useDiary({ diaryId });
  const { data: diary, isLoading, isError } = diaryDetailQuery;

  const tagList = useMemo(() => normalizeTags(diary?.tags), [diary]);

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-fadeIn" />

      <Dialog.Content
        onPointerDownOutside={(e) => e.preventDefault()}
        className="fixed left-1/2 top-1/2 z-50 w-[min(94vw,1366px)] max-h-[150vh] min-h-[80vh] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-sand/40 bg-white shadow-2xl focus:outline-none data-[state=open]:animate-scaleIn"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-sand/30 bg-sand/10 px-8 py-2">
          <div className="min-w-0 space-y-0">
            <Dialog.Title className="text-lg font-semibold text-clay/80">
              {diary ? formatDateWithWeekday(diary.diaryDate) || 'Diary Detail' : 'Diary Detail'}
            </Dialog.Title>
          </div>

          <Dialog.Close asChild>
            <button
              className="ml-6 inline-flex h-10 w-10 items-center justify-center rounded-full text-clay/60 hover:bg-black/5 hover:text-clay/90"
              aria-label="Close"
              onClick={onClose}
            >
              <SquareX className="h-5 w-5" />
            </button>
          </Dialog.Close>
        </div>

        {/* Body */}
        {diary?.title && (
          <p className="text-2xl font-bold tracking-tight text-clay px-8 py-3">{diary.title}</p>
        )}
        {!diaryId ? (
          <div className="px-8 py-10 text-sm text-clay/60">선택된 다이어리가 없습니다.</div>
        ) : isLoading ? (
          <div className="px-8 py-10 text-sm text-clay/60">불러오는 중입니다...</div>
        ) : isError ? (
          <div className="px-8 py-10 text-sm text-red-600">다이어리를 불러오지 못했습니다.</div>
        ) : !diary ? (
          <div className="px-8 py-10 text-sm text-clay/60">내용을 찾을 수 없습니다.</div>
        ) : (
          <div className="flex h-full flex-col">
            <div className="flex-1 overflow-hidden min-h-[540px] px-8 py-4">
              <div className="flex h-full flex-col gap-6 lg:flex-row">
                {/* Left: Diary content (unchanged behavior) */}
                <div className="min-w-0 flex-1">
                  <div className="h-full max-h-[520px] pr-2">
                    <div className="min-h-[500px] max-h-[520px] overflow-y-auto rounded-2xl border border-sand/30 bg-white px-6 py-6 shadow-soft">
                      <div
                        className={[
                          'prose max-w-none',
                          'prose-headings:text-clay',
                          'prose-p:text-clay/90',
                          'prose-strong:text-clay',
                          'prose-li:text-clay/90',
                          'prose-blockquote:text-clay/80',
                          'prose-a:text-amber-900',
                          'leading-7',
                        ].join(' ')}
                        dangerouslySetInnerHTML={{
                          __html: mdParser.render(diary.contentMd || ''),
                        }}
                      />
                    </div>

                    {tagList.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2 pb-4">
                        {tagList.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center rounded-full border border-amber/25 bg-amber/5 px-3 py-1 text-xs font-medium text-amber-900"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: AI comment / related diaries / ads */}
                <aside className="w-full shrink-0 lg:w-[512px]">
                  <div className="flex max-h-[520px] h-full flex-col gap-4 overflow-y-auto pr-1">
                    {/* AI 댓글 */}
                    <DiaryAiCommentSection diaryId={diaryId} />

                    {/* 연관 일기보기 */}
                    <section className="rounded-2xl border border-sand/30 bg-white p-5 shadow-soft">
                      <h3 className="mb-3 text-sm font-semibold text-clay/80">연관 일기 보기</h3>
                      <div className="space-y-2">
                        {[1, 2, 3].map((idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="w-full rounded-xl border border-sand/40 bg-sand/5 px-4 py-3 text-left text-sm text-clay/80 hover:bg-sand/10"
                          >
                            연관 일기 #{idx}
                          </button>
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-clay/60">
                        같은 태그나 비슷한 감정의 기록을 추천해줄 수 있어요.
                      </p>
                    </section>

                    <section className="rounded-2xl border border-dashed border-sand/50 bg-white p-5 text-center shadow-soft">
                      <h3 className="text-sm font-semibold text-clay/80">광고 / 배너</h3>
                      <div className="mt-3 rounded-xl bg-sand/10 px-4 py-10 text-xs text-clay/60">
                        광고 또는 프로모션 영역
                      </div>
                    </section>
                  </div>
                </aside>
              </div>
            </div>

            <div className="border-t border-sand/30 px-8 py-2 ">
              <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-clay/70">
                <div className="flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-clay/80">작성</span>
                    <span>{formatDateTime(diary.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold text-clay/80">수정</span>
                    <span>{formatDateTime(diary.updatedAt)}</span>
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    className="rounded-full border border-sand/60 px-4 py-2 text-sm text-clay/80 hover:bg-black/5"
                    onClick={onClose}
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white hover:opacity-95 active:opacity-90 disabled:opacity-60"
                    onClick={() => diaryId && onEdit?.(diaryId)}
                    disabled={!diaryId}
                  >
                    수정
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default DiaryViewDialog;
