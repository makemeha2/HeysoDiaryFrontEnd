import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { DayPicker } from 'react-day-picker';
import { Calendar, SquareX } from 'lucide-react';
import { useAlertDialog } from '@components/useAlertDialog.jsx';
import ConfirmDialog from '@components/ConfirmDialog.jsx';
import AutocompleteCommitInput from '@components/TagInput.jsx';
import dayjs from 'dayjs';
import { formatDate, formatDateWithWeekday } from '@lib/dateFormatters.js';
import useDiary from '../useDiary.jsx';
import 'react-day-picker/dist/style.css';
import { normalizeTags } from '../diaryUtil.js';
import { ko } from 'date-fns/locale';
import DiaryAiPolishDialog from './DiaryAiPolishDialog.jsx';
import useDiaryAiPolish from '../hooks/useDiaryAiPolish.js';

const FONT_SIZE_STORAGE_KEY = 'diaryEditor.fontSize';
const LINE_HEIGHT_STORAGE_KEY = 'diaryEditor.lineHeight';

const FONT_SIZE_OPTIONS = [
  { label: '작게', value: '14px' },
  { label: '보통', value: '16px' },
  { label: '크게', value: '18px' },
];

const LINE_HEIGHT_OPTIONS = [
  { label: '촘촘', value: '1.5' },
  { label: '보통', value: '1.7' },
  { label: '넉넉', value: '1.9' },
];

const DEFAULT_FONT_SIZE = '16px';
const DEFAULT_LINE_HEIGHT = '1.7';
const POLISH_MIN_LENGTH = 50;
const POLISH_MAX_LENGTH = 3000;

const getStoredEditorSetting = (key, options, fallback) => {
  if (typeof window === 'undefined') return fallback;

  try {
    const stored = window.localStorage.getItem(key);
    const isValid = options.some((option) => option.value === stored);
    return isValid ? stored : fallback;
  } catch {
    return fallback;
  }
};

const persistEditorSetting = (key, value) => {
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore localStorage write failures
  }
};

const toSnapshot = ({ diaryDate, titleInput, contentMdInput, tagList }) => {
  const tags = Array.isArray(tagList)
    ? Array.from(new Set(tagList.map((tag) => String(tag).trim()).filter(Boolean))).sort()
    : [];

  return JSON.stringify({
    diaryDate: formatDate(diaryDate),
    titleInput: titleInput ?? '',
    contentMdInput: contentMdInput ?? '',
    tagList: tags,
  });
};

const DiaryEditDialog = ({ diaryId, isOpen, onClose, onView }) => {
  const { alert, Alert } = useAlertDialog();

  const [diaryDate, setDiaryDate] = useState(() => new Date());
  const [titleInput, setTitleInput] = useState('');
  const [contentMdInput, setContentMdInput] = useState('');
  const [tagList, setTagList] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(() =>
    getStoredEditorSetting(FONT_SIZE_STORAGE_KEY, FONT_SIZE_OPTIONS, DEFAULT_FONT_SIZE),
  );
  const [editorLineHeight, setEditorLineHeight] = useState(() =>
    getStoredEditorSetting(LINE_HEIGHT_STORAGE_KEY, LINE_HEIGHT_OPTIONS, DEFAULT_LINE_HEIGHT),
  );

  const [isPolishDialogOpen, setIsPolishDialogOpen] = useState(false);
  const [originalContent, setOriginalContent] = useState('');

  const [initialFormSnapshot, setInitialFormSnapshot] = useState(null);
  const [isDiscardConfirmOpen, setIsDiscardConfirmOpen] = useState(false);

  const { polishedContent, polishError, isPolishing, usageText, requestPolish, resetPolish } =
    useDiaryAiPolish();

  const isEditMode = !!diaryId;

  const currentFormSnapshot = useMemo(
    () => toSnapshot({ diaryDate, titleInput, contentMdInput, tagList }),
    [diaryDate, titleInput, contentMdInput, tagList],
  );

  const isDirty = initialFormSnapshot !== null && currentFormSnapshot !== initialFormSnapshot;

  const setFormStateAndSnapshot = ({
    nextDiaryDate,
    nextTitleInput,
    nextContentMdInput,
    nextTagList,
  }) => {
    setDiaryDate(nextDiaryDate);
    setTitleInput(nextTitleInput);
    setContentMdInput(nextContentMdInput);
    setTagList(nextTagList);
    setTagDraft('');
    setIsCalendarOpen(false);

    setInitialFormSnapshot(
      toSnapshot({
        diaryDate: nextDiaryDate,
        titleInput: nextTitleInput,
        contentMdInput: nextContentMdInput,
        tagList: nextTagList,
      }),
    );
  };

  const resetPolishState = () => {
    setIsPolishDialogOpen(false);
    setOriginalContent('');
    resetPolish();
  };

  const resetForm = () => {
    setFormStateAndSnapshot({
      nextDiaryDate: new Date(),
      nextTitleInput: '',
      nextContentMdInput: '',
      nextTagList: [],
    });
    resetPolishState();
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

  const handleTryCloseEditor = () => {
    if (saveDiaryMutation.isPending) return;

    if (isDirty) {
      setIsDiscardConfirmOpen(true);
      return;
    }

    onClose?.();
  };

  const handleOpenPolishDialog = () => {
    setOriginalContent(contentMdInput ?? '');
    resetPolish();
    setIsPolishDialogOpen(true);
  };

  const closePolishDialog = () => {
    resetPolishState();
  };

  const handlePolishDialogOpenChange = (open) => {
    if (!open) {
      closePolishDialog();
    }
  };

  const polishSourceLength = originalContent.length;
  const isPolishSourceTooShort = polishSourceLength < POLISH_MIN_LENGTH;
  const isPolishSourceTooLong = polishSourceLength > POLISH_MAX_LENGTH;
  const canRequestPolish = !isPolishing && !isPolishSourceTooShort && !isPolishSourceTooLong;
  const requestButtonLabel = `AI에게 요청 · ${usageText}`;

  const handleRequestPolish = async () => {
    if (!canRequestPolish) return;

    await requestPolish({
      diaryId: diaryId ?? null,
      content: originalContent,
    });
  };

  const handleApplyPolishedContent = () => {
    if (!polishedContent.trim() || isPolishing) return;

    setContentMdInput(polishedContent);
    closePolishDialog();
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

    const parsedDate = dayjs(diaryDetail.diaryDate);
    const nextDiaryDate = parsedDate.isValid() ? parsedDate.toDate() : new Date();

    setFormStateAndSnapshot({
      nextDiaryDate,
      nextTitleInput: diaryDetail.title || '',
      nextContentMdInput: diaryDetail.contentMd ?? '',
      nextTagList: normalizedTags,
    });

    resetPolishState();
  }, [isOpen, diaryId, diaryDetail, normalizedTags]);

  useEffect(() => {
    persistEditorSetting(FONT_SIZE_STORAGE_KEY, editorFontSize);
  }, [editorFontSize]);

  useEffect(() => {
    persistEditorSetting(LINE_HEIGHT_STORAGE_KEY, editorLineHeight);
  }, [editorLineHeight]);

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
                      root: 'p-3',
                      months: 'flex flex-col items-center',
                      month:
                        'grid grid-cols-[auto_1fr_auto] grid-rows-[auto_1fr] items-center gap-y-3',
                      month_caption:
                        'col-start-2 row-start-1 flex items-center justify-center px-1',
                      caption: 'flex items-center justify-center gap-2',
                      caption_label: 'text-sm font-semibold text-clay/90 whitespace-nowrap',
                      dropdowns: 'flex items-center gap-2',
                      dropdown:
                        'rounded-lg border border-sand/60 bg-white px-2 py-1 text-sm text-clay shadow-sm focus:outline-none focus:ring-2 focus:ring-amber/30',
                      nav: 'absolute inset-x-0 flex items-center justify-between',
                      button:
                        'inline-flex h-8 w-8 items-center justify-center rounded-xl border border-sand/60 bg-white text-clay/70 shadow-sm transition hover:bg-sand/20 hover:text-clay focus:outline-none focus:ring-2 focus:ring-amber/30',
                      button_previous: '!static col-start-1 row-start-1',
                      button_next: '!static col-start-3 row-start-1',
                      chevron: 'h-4 w-4',
                      month_grid: 'col-span-3 row-start-2',
                      head_row: 'flex',
                      head_cell: 'w-10 text-[11px] font-semibold text-clay/50 tracking-wide',
                      row: 'flex mt-1',
                      cell: 'w-10 h-10 p-0 text-center',
                      day_button:
                        'h-10 w-10 rounded-xl text-sm font-medium text-clay/80 transition ' +
                        'hover:bg-amber/15 hover:text-clay ' +
                        'focus:outline-none focus:ring-2 focus:ring-amber/30',
                      today: 'text-clay font-semibold ring-1 ring-sand/60',
                      selected: 'bg-amber text-white shadow-md hover:bg-amber hover:text-white',
                      day_selected: 'bg-amber text-white shadow-md hover:bg-amber hover:text-white',
                      outside: 'text-clay/30 opacity-60',
                      disabled: 'text-clay/25 opacity-50',
                    }}
                  />
                </div>
              )}
            </Dialog.Title>

            <button
              type="button"
              className="text-clay/60 hover:text-clay/80"
              aria-label="Close"
              onClick={handleTryCloseEditor}
            >
              <SquareX />
            </button>
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

            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand/60 bg-sand/20 px-3 py-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs text-clay/60" htmlFor="diary-font-size">
                    글자 크기
                  </label>
                  <select
                    id="diary-font-size"
                    value={editorFontSize}
                    onChange={(e) => setEditorFontSize(e.target.value)}
                    className="rounded-lg border border-sand/60 bg-white px-2.5 py-1.5 text-xs text-clay/80 focus:outline-none focus:ring-2 focus:ring-amber/30"
                  >
                    {FONT_SIZE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <label className="ml-2 text-xs text-clay/60" htmlFor="diary-line-height">
                    줄간격
                  </label>
                  <select
                    id="diary-line-height"
                    value={editorLineHeight}
                    onChange={(e) => setEditorLineHeight(e.target.value)}
                    className="rounded-lg border border-sand/60 bg-white px-2.5 py-1.5 text-xs text-clay/80 focus:outline-none focus:ring-2 focus:ring-amber/30"
                  >
                    {LINE_HEIGHT_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <span className="ml-2 text-xs text-clay/60 font-bold">
                    {contentMdInput.length}자
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPolishDialog}
                    className="rounded-lg border border-sand/60 bg-white px-2.5 py-1.5 text-xs text-clay/80 hover:bg-sand/20 focus:outline-none focus:ring-2 focus:ring-amber/30"
                  >
                    글 다듬기
                  </button>
                </div>
              </div>

              <textarea
                id="diary-content"
                value={contentMdInput}
                onChange={(e) => setContentMdInput(e.target.value)}
                placeholder="오늘 하루를 차분하게 기록해보세요."
                style={{
                  fontSize: editorFontSize,
                  lineHeight: editorLineHeight,
                }}
                className="h-[550px] w-full resize-none overflow-y-auto whitespace-pre-wrap rounded-2xl border border-sand/60 bg-white/90 px-5 py-4 text-clay placeholder:text-clay/40 focus:outline-none focus:ring-2 focus:ring-amber/40"
              />
            </div>

            <div className="space-y-2">
              <AutocompleteCommitInput
                items={Array.isArray(myTags) ? myTags : []}
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

      <DiaryAiPolishDialog
        open={isPolishDialogOpen}
        onOpenChange={handlePolishDialogOpenChange}
        originalContent={originalContent}
        polishedContent={polishedContent}
        polishError={polishError}
        isPolishing={isPolishing}
        canRequestPolish={canRequestPolish}
        requestButtonLabel={requestButtonLabel}
        isPolishSourceTooShort={isPolishSourceTooShort}
        isPolishSourceTooLong={isPolishSourceTooLong}
        onRequestPolish={handleRequestPolish}
        onApply={handleApplyPolishedContent}
        onCancel={closePolishDialog}
      />

      <ConfirmDialog
        open={isDiscardConfirmOpen}
        onOpenChange={(open) => {
          if (!open) setIsDiscardConfirmOpen(false);
        }}
        title="변경 사항을 저장하지 않고 닫을까요?"
        description="저장하지 않은 내용은 사라집니다."
        confirmLabel="닫기"
        cancelLabel="계속 작성"
        onConfirm={() => {
          setIsDiscardConfirmOpen(false);
          onClose?.();
        }}
        onCancel={() => setIsDiscardConfirmOpen(false)}
      />
    </>
  );
};

export default DiaryEditDialog;
