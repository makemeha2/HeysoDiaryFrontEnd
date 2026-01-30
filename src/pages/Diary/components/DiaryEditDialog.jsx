import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { DayPicker } from 'react-day-picker';
import MarkdownIt from 'markdown-it';
import markdownItIns from 'markdown-it-ins';
import MdEditor from 'react-markdown-editor-lite';
import { Calendar, SquareX } from 'lucide-react';
import { useAlertDialog } from '@components/useAlertDialog.jsx';
import AutocompleteCommitInput from '@components/TagInput.jsx';
import dayjs from 'dayjs';
import { formatDate, formatDateWithWeekday } from '@lib/dateFormatters.js';
import useDiary from '../useDiary.jsx';
import 'react-day-picker/dist/style.css';
import 'react-markdown-editor-lite/lib/index.css';
import { normalizeTags } from '../diaryUtil.js';
import { ko } from 'date-fns/locale';

const mdParser = new MarkdownIt();
mdParser.use(markdownItIns);

const DiaryEditDialog = ({ diaryId, isOpen, onClose, onView }) => {
  const { alert, Alert } = useAlertDialog();

  const [diaryDate, setDiaryDate] = useState(() => new Date());
  const [titleInput, setTitleInput] = useState('');
  const [contentMdInput, setContentMdInput] = useState('');
  const [tagList, setTagList] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const isEditMode = !!diaryId;

  const resetForm = () => {
    setDiaryDate(new Date());
    setTitleInput('');
    setContentMdInput('');
    setTagList([]);
    setTagDraft('');
    setIsCalendarOpen(false);
  };

  const handleSaveSuccess = async (data, _variables, { refreshAfterSave }) => {
    await alert({
      title: '알림',
      description: isEditMode ? '수정되었습니다.' : '등록되었습니다.',
      actionLabel: '확인',
    });

    const savedDiaryId = diaryId ?? data?.diaryId;
    await refreshAfterSave(savedDiaryId);

    if (savedDiaryId && onView) {
      onView(savedDiaryId);
      return;
    }

    onClose?.();
  };

  const { diaryDetailQuery, saveDiaryMutation, myTags, myTagsQuery } = useDiary({
    diaryId: isOpen ? diaryId : null,
    onSaveSuccess: handleSaveSuccess,
    onSaveError: (err) => {
      console.error(err);
    },
  });

  const { data: diaryDetail, isFetching: isDiaryLoading } = diaryDetailQuery;

  // 저장 버튼 클릭 이벤트
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!titleInput.trim() && !contentMdInput.trim()) return;

    const payload = {
      diaryId: diaryId,
      title: titleInput.trim() || 'Untitled',
      contentMd: contentMdInput.trim(),
      diaryDate: formatDate(diaryDate),
      tags: Array.from(new Set(tagList)),
    };

    saveDiaryMutation.mutate(payload);
  };

  // 태그 등록
  const addTag = (rawTag = tagDraft) => {
    const nextTag = rawTag.trim();
    if (!nextTag) return;

    const exists = tagList.some((t) => t.toLowerCase() === nextTag.toLowerCase());
    if (exists) {
      setTagDraft('');
      return;
    }

    setTagList((prev) => [...prev, nextTag]);
    setTagDraft('');
  };

  // 태그 삭제
  const removeTag = (tag) => {
    setTagList((prev) => prev.filter((t) => t !== tag));
  };

  // 태그 normalize
  const normalizedTags = useMemo(() => normalizeTags(diaryDetail?.tags), [diaryDetail]);

  // 수정 모드: diaryDetail이 늦게 도착할 수 있으니, 데이터가 들어오면 폼을 동기화합니다.
  useEffect(() => {
    if (!isOpen) return;

    // create mode
    if (!diaryId) {
      resetForm();
      return;
    }

    if (!diaryDetail) return;

    setTitleInput(diaryDetail.title || '');
    setContentMdInput(diaryDetail.contentMd ?? '');
    setTagList(normalizedTags);

    const parsedDate = dayjs(diaryDetail.diaryDate);
    setDiaryDate(parsedDate.isValid() ? parsedDate.toDate() : new Date());
  }, [isOpen, diaryId, diaryDetail, normalizedTags]);

  return (
    <>
      <Alert />

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-40 w-[min(90vw,1120px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/50 bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-scaleIn"
        >
          <div className="flex items-start justify-between">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-clay">
              <button type="button" onClick={() => setIsCalendarOpen((prev) => !prev)}>
                <Calendar className="w-5 h-5" />
              </button>

              <span className="text-[16px] font-bold text-clay/80 underline">
                {formatDateWithWeekday(diaryDate)}
              </span>

              {isCalendarOpen && (
                <div className="absolute left-10 top-12 z-10 flex justify-center rounded-2xl border border-sand/60 bg-white/95 p-3 shadow-[0_30px_80px_-50px_rgba(91,70,54,0.8)] backdrop-blur">
                  <DayPicker
                    mode="single"
                    selected={diaryDate}
                    onSelect={(date) => {
                      setDiaryDate(date || new Date());
                      setIsCalendarOpen(false);
                    }}
                    captionLayout="label"
                    navLayout="around"
                    formatters={{
                      formatCaption: (month) => dayjs(month).format('YYYY-MM'),
                    }}
                    className="rounded-2xl"
                    locale={ko}
                    styles={{
                      root: {
                        '--rdp-accent-color': '#d9b26a',
                        '--rdp-accent-color-dark': '#d9b26a',
                        '--rdp-background-color': '#ffffff',
                      },
                    }}
                    classNames={{
                      // 전체 wrapper
                      root: 'p-3',

                      // month 레이아웃
                      months: 'flex flex-col items-center',
                      month:
                        'grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr] items-center gap-y-3',

                      // 상단 캡션 영역(월/네비)
                      month_caption:
                        'col-start-2 row-start-1 flex items-center justify-center px-1',
                      caption: 'flex items-center justify-center gap-2',
                      caption_label: 'text-sm font-semibold text-clay/90 whitespace-nowrap',
                      dropdowns: 'flex items-center gap-2',
                      dropdown:
                        'rounded-lg border border-sand/60 bg-white px-2 py-1 text-sm text-clay shadow-sm focus:outline-none focus:ring-2 focus:ring-amber/30',

                      // 네비 버튼(이전/다음)
                      nav: 'absolute inset-x-0 flex items-center justify-between',
                      button:
                        'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-sand/60 bg-white text-clay/70 shadow-sm transition hover:bg-sand/20 hover:text-clay focus:outline-none focus:ring-2 focus:ring-amber/30',
                      button_previous: '!static col-start-1 row-start-1',
                      button_next: '!static col-start-3 row-start-1',
                      chevron: 'h-4 w-4',

                      // 캘린더 그리드
                      month_grid: 'col-span-3 row-start-2',

                      // 요일 헤더
                      head_row: 'flex',
                      head_cell: 'w-10 text-[11px] font-semibold text-clay/50 tracking-wide',

                      // 날짜 grid
                      row: 'flex mt-1',
                      cell: 'w-10 h-10 p-0 text-center',

                      // 날짜 버튼
                      day_button:
                        'h-10 w-10 rounded-xl text-sm font-medium text-clay/80 transition ' +
                        'hover:bg-amber/15 hover:text-clay ' +
                        'focus:outline-none focus:ring-2 focus:ring-amber/30',

                      // 오늘
                      today: 'text-clay font-semibold ring-1 ring-sand/60',

                      // 선택됨
                      selected: 'bg-amber text-white shadow-md hover:bg-amber hover:text-white',

                      // 선택된 날짜 (버튼 자체에 적용되도록)
                      day_selected: 'bg-amber text-white shadow-md hover:bg-amber hover:text-white',

                      // 범위/비활성 등(싱글모드라도 기본값)
                      outside: 'text-clay/30 opacity-60',
                      disabled: 'text-clay/25 opacity-50',
                    }}
                  />
                </div>
              )}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button className="text-clay/60 hover:text-clay/80" aria-label="Close">
                <SquareX />
              </button>
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-5">
            <div className="space-y-2">
              <input
                id="diary-title"
                value={titleInput}
                maxLength={200}
                onChange={(e) => setTitleInput(e.target.value)}
                className="w-full rounded-xl border border-sand/60 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
                placeholder=""
              />
              <div className="text-right text-xs text-clay/50">{titleInput.length}/200</div>
            </div>

            <div className="space-y-2">
              <MdEditor
                value={contentMdInput}
                style={{ height: '550px' }}
                view={{
                  menu: true,
                  md: true,
                  html: false,
                }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) => setContentMdInput(text)}
                placeholder="Write your thoughts in Markdown..."
              />
            </div>

            <div className="space-y-2">
              <AutocompleteCommitInput
                items={Array.isArray(myTags) ? myTags : []}
                // exclude={tagList}
                onCommit={(value) => addTag(value)}
                placeholder="태그를 입력해보세요. Enter 또는 콤마로 추가됩니다."
                disabled={myTagsQuery?.isLoading}
                className="w-full"
              />
              {tagList.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tagList.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 rounded-full bg-amber/10 px-3 py-1 text-sm text-amber-900 border border-amber/30"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-xs text-amber-900/70 hover:text-amber-900"
                        aria-label={`Remove tag ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-clay/60">AI와 친구가 되어보세요.</span>
              <button
                type="submit"
                className="rounded-full bg-amber text-white px-5 py-2.5 hover:opacity-95 active:opacity-90 disabled:opacity-60"
                disabled={saveDiaryMutation.isPending || isDiaryLoading}
              >
                {saveDiaryMutation.isPending ? '저장중...' : '저장'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
};

export default DiaryEditDialog;
