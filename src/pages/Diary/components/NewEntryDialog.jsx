import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { DayPicker } from 'react-day-picker';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import * as Dialog from '@radix-ui/react-dialog';
import { authFetch } from '../../../lib/apiClient.js';
import 'react-day-picker/dist/style.css';
import 'react-markdown-editor-lite/lib/index.css';
import { Calendar, Clover, SquareX } from 'lucide-react';

const mdParser = new MarkdownIt();

const formatDate = (date) => (date ? date.toISOString().slice(0, 10) : '');

const NewEntryDialog = ({ onAddEntry, onClose }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [showCalendar, setShowCalendar] = useState(false);

  const mutation = useMutation({
    mutationFn: async (payload) => {
      const res = await authFetch('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to create diary entry');
      }
      const data = await res.json();
      return typeof data === 'number' ? data : data?.diaryId;
    },
    onSuccess: (diaryId, variables) => {
      const now = new Date();
      const entry = {
        id: diaryId || crypto.randomUUID(),
        title: variables.title,
        content: variables.contentMd,
        date: now.toISOString(),
        tags: variables.tags || [],
        diaryDate: variables.diaryDate,
      };
      onAddEntry(entry);
      setTitle('');
      setContent('');
      setTags([]);
      setTagInput('');
      setSelectedDate(new Date());
      if (onClose) onClose();
    },
    onError: (err) => {
      console.error(err);
    },
  });

  function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;
    const now = new Date();
    const diaryDate = formatDate(selectedDate || now);
    const uniqueTags = tags.filter((tag, index) => tags.indexOf(tag) === index);
    const payload = {
      userId: 2,
      title: title.trim() || 'Untitled',
      contentMd: content.trim(),
      diaryDate,
      tags: uniqueTags,
    };
    mutation.mutate(payload);
  }

  function addTag() {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    const exists = tags.some((tag) => tag.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      setTagInput('');
      return;
    }
    setTags((prev) => [...prev, trimmed]);
    setTagInput('');
  }

  function removeTag(tag) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm data-[state=open]:animate-fadeIn" />
      <Dialog.Content className="fixed left-1/2 top-1/2 w-[min(90vw,1120px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/50 bg-white p-6 shadow-2xl focus:outline-none data-[state=open]:animate-scaleIn">
        <div className="flex items-start justify-between">
          <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-clay">
            <Clover className="h-5 w-5" />
            <span>오늘의 기록을 남겨보세요.</span>
          </Dialog.Title>
          <Dialog.Close asChild>
            <button className="text-clay/60 hover:text-clay/80" aria-label="Close">
              <SquareX />
            </button>
          </Dialog.Close>
        </div>
        <Dialog.Description className="mt-1 text-sm text-clay/60"></Dialog.Description>

        <div className="mt-3 flex justify-end">
          <div className="relative flex items-center gap-2">
            <button type="button" onClick={() => setShowCalendar((prev) => !prev)}>
              <Calendar className="w-5 h-5" />
            </button>
            <span className="text-[14px] font-medium text-clay/80 underline">
              {formatDate(selectedDate)}
            </span>
            {showCalendar && (
              <div className="absolute right-0 top-12 z-10 rounded-xl border border-sand/60 bg-white shadow-lg">
                <DayPicker
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date || new Date());
                    setShowCalendar(false);
                  }}
                  captionLayout="dropdown-buttons"
                  styles={{
                    caption: { color: '#5c4033', fontWeight: 600 },
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                id="entry-title"
                value={title}
                maxLength={200}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-xl border border-sand/60 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
                placeholder=""
              />
            </div>

            <div className="text-right text-xs text-clay/50">{title.length}/200</div>
          </div>

          <div className="space-y-2">
            <MdEditor
              value={content}
              style={{ height: '280px' }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={({ text }) => setContent(text)}
              placeholder="Write your thoughts in Markdown..."
            />
          </div>

          <div className="space-y-2">
            <input
              id="tag-input"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="w-full rounded-xl border border-sand/60 bg-white/80 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
              placeholder="태그를 입력해보세요. Enter를 누르면 추가됩니다."
            />
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
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
            <span className="text-sm text-clay/60">Stored locally in your browser</span>
            <button
              type="submit"
              className="rounded-full bg-amber text-white px-5 py-2.5 hover:opacity-95 active:opacity-90 disabled:opacity-60"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  );
};

export default NewEntryDialog;
