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
                <div className="absolute left-10 top-12 z-10 rounded-xl border border-sand/60 bg-white shadow-lg">
                  <DayPicker
                    mode="single"
                    selected={diaryDate}
                    onSelect={(date) => {
                      setDiaryDate(date || new Date());
                      setIsCalendarOpen(false);
                    }}
                    captionLayout="dropdown-buttons"
                    styles={{
                      caption: { color: '#5c4033', fontWeight: 600 },
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
