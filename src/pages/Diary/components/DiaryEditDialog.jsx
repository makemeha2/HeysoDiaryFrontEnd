import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { DayPicker } from 'react-day-picker';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { Calendar, SquareX } from 'lucide-react';
import { useAlertDialog } from '../../ShareComponents/useAlertDialog.jsx';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { authFetch } from '../../../lib/apiClient.js';
import 'react-day-picker/dist/style.css';
import 'react-markdown-editor-lite/lib/index.css';

dayjs.locale('ko');

const mdParser = new MarkdownIt();

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

const DiaryEditDialog = ({ diaryId, onClose }) => {
  const queryClient = useQueryClient();
  const { alert, Alert } = useAlertDialog();

  const isEditMode = !!diaryId;

  const [diaryDate, setDiaryDate] = useState(() => new Date());
  const [titleInput, setTitleInput] = useState('');
  const [contentMdInput, setContentMdInput] = useState('');
  const [tagList, setTagList] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const resetForm = () => {
    setTitleInput('');
    setContentMdInput('');
    setTagList([]);
    setTagDraft('');
    setDiaryDate(new Date());
    setIsCalendarOpen(false);
  };

  // 상세 조회
  const { data: diaryDetail, isFetching: isDiaryLoading } = useQuery({
    queryKey: ['diaryDetail', diaryId],
    enabled: !!diaryId,
    queryFn: async ({ signal }) => {
      const res = await authFetch(`/api/diary/${diaryId}`, { method: 'GET', signal });
      if (!res.ok) {
        throw new Error('Failed to load diary');
      }
      return res.data;
    },
  });

  // 저장 버튼 클릭 이벤트
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!titleInput.trim() && !contentMdInput.trim()) return;

    const payload = {
      diaryId: diaryId,
      title: titleInput.trim() || 'Untitled',
      contentMd: contentMdInput.trim(),
      diaryDate: dayjs(diaryDate).format('YYYY-MM-DD'),
      tags: Array.from(new Set(tagList)),
    };

    saveDiaryMutation.mutate(payload);
  };

  // 일기 저장
  const saveDiaryMutation = useMutation({
    mutationFn: async (payload) => {
      const shouldUpdate = diaryId && diaryDetail;

      // diary 수정
      if (shouldUpdate) {
        const res = await authFetch(`/api/diary/${diaryId}/edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          throw new Error('Failed to update diary');
        }

        return res.data;
      }

      // const res = await authFetch('/api/diary', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(payload),
      // });

      // if (!res.ok) {
      //   throw new Error('Failed to create diary');
      // }

      // const data = await res.json();
      // return typeof data === 'number' ? data : data?.diaryId;
    },

    onSuccess: async () => {
      console.log('성공?');

      await alert({ title: '알림', description: '수정되었습니다.', actionLabel: '확인' });

      await Promise.all([
        // 오른쪽 최신 목록 현행화
        queryClient.refetchQueries({
          queryKey: ['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE],
        }),
        // 날짜 선택시 일자별 목록 갱신
        queryClient.invalidateQueries({ queryKey: ['diaryDaily'] }),

        // 달력의 날짜 갱신
        queryClient.refetchQueries({ queryKey: ['monthlyDiaryCounts'] }),

        queryClient.refetchQueries({ queryKey: ['diaryDetail', diaryId] }),
      ]);

      // resetForm();
      onClose?.();
    },

    onError: (err) => {
      console.error(err);
    },
  });

  // 태그 등록
  const addTag = () => {
    const nextTag = tagDraft.trim();
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
  const normalizedTags = useMemo(() => {
    if (!diaryDetail?.tags) return [];
    if (Array.isArray(diaryDetail.tags)) return diaryDetail.tags;
    if (typeof diaryDetail.tags === 'string') {
      return diaryDetail.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
    }
    return [];
  }, [diaryDetail]);

  useEffect(() => {
    if (!diaryId) {
      resetForm();
      return;
    }
  }, [diaryId]);

  useEffect(() => {
    if (!diaryId || !diaryDetail) return;

    setTitleInput(diaryDetail.title || '');
    setContentMdInput(diaryDetail.contentMd ?? diaryDetail.content ?? '');
    setTagList(normalizedTags);

    const parsedDate = dayjs(diaryDetail.diaryDate ?? diaryDetail.date);
    setDiaryDate(parsedDate.isValid() ? parsedDate.toDate() : new Date());
  }, [diaryId, diaryDetail, normalizedTags]);

  return (
    <>
      <Alert />

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fadeIn" />
        <Dialog.Content
          onPointerDownOutside={(e) => e.preventDefault()}
          className="fixed left-1/2 top-1/2 z-40 w-[min(90vw,1120px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/50 bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-scaleIn"
        >
          <div className="flex items-start justify-between">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-clay">
              <button type="button" onClick={() => setIsCalendarOpen((prev) => !prev)}>
                <Calendar className="w-5 h-5" />
              </button>

              <span className="text-[16px] font-bold text-clay/80 underline">
                {dayjs(diaryDate).format('YYYY-MM-DD (ddd)')}
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
                style={{ height: '280px' }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={({ text }) => setContentMdInput(text)}
                placeholder="Write your thoughts in Markdown..."
              />
            </div>

            <div className="space-y-2">
              <input
                id="diary-tag-input"
                value={tagDraft}
                onChange={(e) => setTagDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag();
                  }
                }}
                className="w-full rounded-xl border border-sand/60 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
                placeholder="태그를 입력해보세요. Enter를 누르면 추가됩니다."
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
              <span className="text-sm text-clay/60">
                {isEditMode ? '기존 글을 수정합니다.' : 'Entries are saved securely to your diary'}
              </span>
              <button
                type="submit"
                className="rounded-full bg-amber text-white px-5 py-2.5 hover:opacity-95 active:opacity-90 disabled:opacity-60"
                disabled={saveDiaryMutation.isPending || isDiaryLoading}
              >
                {saveDiaryMutation.isPending ? 'Saving...' : isEditMode ? 'Update' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </>
  );
};

export default DiaryEditDialog;
