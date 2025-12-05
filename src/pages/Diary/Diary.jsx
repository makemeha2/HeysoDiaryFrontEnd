import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import NewEntryDialog from './components/NewEntryDialog.jsx';
import { authFetch } from '../../lib/apiClient.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

const Diary = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: entries = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE],
    queryFn: ({ signal }) => loadEntries({ signal, page: DEFAULT_PAGE, size: DEFAULT_SIZE }),
  });

  const loadEntries = async ({ signal, page = DEFAULT_PAGE, size = DEFAULT_SIZE } = {}) => {
    const safePage = Math.max(1, page);
    const safeSize = Math.min(100, Math.max(1, size));
    const params = new URLSearchParams({
      page: String(safePage),
      size: String(safeSize),
    });

    const response = await authFetch(`/api/diary?${params.toString()}`, { signal });
    if (!response.ok) {
      throw new Error('Failed to load diary entries');
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.data)
      ? payload.data
      : Array.isArray(payload?.content)
        ? payload.content
        : Array.isArray(payload)
          ? payload
          : [];

    return items.map((item) => {
      const dateValue =
        item.diaryDate || item.createdAt || item.updatedAt || new Date().toISOString();

      return {
        id: item.diaryId ?? crypto.randomUUID(),
        diaryId: item.diaryId,
        authorId: item.authorId,
        authorNickname: item.authorNickname,
        title: item.title ?? '',
        content: item.contentMd ?? '',
        contentMd: item.contentMd ?? '',
        date: dateValue,
        diaryDate: item.diaryDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        tags: item.tags ?? [],
      };
    });
  };

  const sorted = useMemo(
    () => [...entries].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [entries],
  );

  const handleEntryCreated = (entry) => {
    queryClient.setQueryData(['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE], (prev = []) => [
      entry,
      ...prev,
    ]);
    queryClient.invalidateQueries({ queryKey: ['diaryEntries'] });
  };

  const removeEntry = (id) => {
    queryClient.setQueryData(['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE], (prev = []) =>
      prev.filter((entry) => entry.id !== id),
    );
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="bg-white/70 rounded-2xl p-6 shadow-soft border border-sand/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-clay/60">Capture a moment</p>
            <h2 className="text-xl font-semibold">New Entry</h2>
          </div>
          <Dialog.Root open={dialogOpen} onOpenChange={setDialogOpen}>
            <Dialog.Trigger asChild>
              <button className="rounded-full bg-amber text-white px-4 py-2 text-sm font-medium hover:opacity-95 active:opacity-90">
                New
              </button>
            </Dialog.Trigger>
            <NewEntryDialog onAddEntry={handleEntryCreated} onClose={() => setDialogOpen(false)} />
          </Dialog.Root>
        </div>
        <p className="mt-4 text-sm text-clay/70">
          Click "New" to open a focused editor and record today&apos;s note.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        {isLoading && (
          <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/70">
            Loading entries...
          </div>
        )}
        {isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
            {error?.message || 'Failed to load diary entries.'}
          </div>
        )}
        {!isLoading && !isError && sorted.length === 0 && (
          <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/70">
            No entries yet. Your first note will appear here.
          </div>
        )}
        <ul className="space-y-3">
          {sorted.map((e) => (
            <li
              key={e.id}
              className="group rounded-2xl border border-sand/50 bg-white/70 p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">{e.title}</h3>
                  <time className="text-sm text-clay/60">{new Date(e.date).toLocaleString()}</time>
                </div>
                <button
                  onClick={() => removeEntry(e.id)}
                  className="text-sm text-clay/60 hover:text-clay/90"
                  title="Delete entry"
                >
                  Delete
                </button>
              </div>
              {e.content && (
                <p className="mt-3 whitespace-pre-wrap leading-relaxed text-clay/90">{e.content}</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default Diary;
