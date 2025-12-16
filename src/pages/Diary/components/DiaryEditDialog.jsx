import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import { DayPicker } from 'react-day-picker';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import { Calendar, SquareX } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { authFetch } from '../../../lib/apiClient.js';
import 'react-day-picker/dist/style.css';
import 'react-markdown-editor-lite/lib/index.css';

dayjs.locale('ko');

const mdParser = new MarkdownIt();

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

const DiaryEditDialog = ({ onClose }) => {
  const queryClient = useQueryClient();

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

  const createDiaryMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await authFetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('Failed to create diary');
      }

      // 백엔드가 diaryId(number) 또는 { diaryId } 형태로 주는 기존 가정 유지
      const data = await res.json();
      return typeof data === 'number' ? data : data?.diaryId;
    },

    onSuccess: async () => {
      // ✅ 서버가 진실: 바로 목록 재조회
      await queryClient.refetchQueries({
        queryKey: ['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE],
      });

      resetForm();
      onClose?.();
    },

    onError: (err) => {
      console.error(err);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!titleInput.trim() && !contentMdInput.trim()) return;

    const payload = {
      title: titleInput.trim() || 'Untitled',
      contentMd: contentMdInput.trim(),
      diaryDate: dayjs(diaryDate).format('YYYY-MM-DD'),
      tags: Array.from(new Set(tagList)), // ✅ 중복 제거
    };

    createDiaryMutation.mutate(payload);
  };

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

  const removeTag = (tag) => {
    setTagList((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fadeIn" />
      <Dialog.Content
        onPointerDownOutside={(e) => e.preventDefault()} // 바깥 클릭 닫힘 방지
        className="fixed left-1/2 top-1/2 w-[min(90vw,1120px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/50 bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-scaleIn"
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
            <span className="text-sm text-clay/60">Entries are saved securely to your diary</span>
            <button
              type="submit"
              className="rounded-full bg-amber text-white px-5 py-2.5 hover:opacity-95 active:opacity-90 disabled:opacity-60"
              disabled={createDiaryMutation.isPending}
            >
              {createDiaryMutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default DiaryEditDialog;
