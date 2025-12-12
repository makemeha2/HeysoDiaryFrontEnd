import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import NewEntryDialog from './components/NewEntryDialog.jsx';
import DiaryCalender from './components/DiaryCalender.jsx';
import { authFetch } from '../../lib/apiClient.js';
import { useAuthStore } from '../../stores/authStore.js';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

// 새 글 작성과 최근 글 목록을 모두 보여주는 다이어리 페이지 컴포넌트.
const Diary = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuthStore((s) => s.auth);

  // 페이지네이션으로 다이어리 목록을 불러오고 응답 형태를 통일합니다.
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

    const items = Array.isArray(payload?.diaries) ? payload.diaries : [];

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
        tags: Array.isArray(item.tags) ? item.tags : item.tags ? [item.tags] : [],
      };
    });
  };

  const {
    data: entries = [],
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE],
    queryFn: ({ signal }) => loadEntries({ signal, page: DEFAULT_PAGE, size: DEFAULT_SIZE }),
    enabled: !!auth,
    staleTime: 0,
  });

  const sorted = useMemo(() => {
    return [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [entries]);

  const formatDateKey = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 당장은 필요없지만 추후 사용될지 몰라 일단 남겨둠
  const handleEntryCreated = (entry) => {};

  // 로컬 캐시에서 글을 제거합니다.
  const removeEntry = (id) => {
    queryClient.setQueryData(['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE], (prev = []) =>
      prev.filter((entry) => entry.id !== id),
    );
  };

  // 로그인 여부에 따라 새 글 다이얼로그를 열거나 로그인 페이지로 이동합니다.
  const handleDialogOpenChange = (nextOpen) => {
    if (nextOpen && !auth) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setDialogOpen(nextOpen);
  };

  const handleGoLogin = () => {
    navigate('/login', { state: { from: location } });
  };

  const handleSingleEntryDoubleClick = (entry) => {
    // 추후 상세 보기 화면으로 이동하도록 사용할 수 있습니다.
    console.log('Open entry detail', entry);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="bg-white/70 rounded-2xl p-6 shadow-soft border border-sand/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-clay/60">Capture a moment</p>
            <h2 className="text-xl font-semibold">New Entry</h2>
          </div>
          <Dialog.Root open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <Dialog.Trigger asChild>
              <button className="rounded-full bg-amber text-white px-4 py-2 text-sm font-medium hover:opacity-95 active:opacity-90">
                New
              </button>
            </Dialog.Trigger>
            <NewEntryDialog onAddEntry={handleEntryCreated} onClose={() => setDialogOpen(false)} />
          </Dialog.Root>
        </div>
        <div className="mt-4">
          <DiaryCalender
            entries={sorted}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSingleEntryDoubleClick={handleSingleEntryDoubleClick}
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>
        {!auth ? (
          <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-semibold">로그인을 하면 내가 쓴 글이 보입니다.</p>
              <p className="text-sm text-clay/60 mt-1">
                작성한 다이어리를 확인하려면 로그인해주세요.
              </p>
            </div>
            <button
              onClick={handleGoLogin}
              className="self-start rounded-full bg-amber text-white px-4 py-2 text-sm font-medium hover:opacity-95 active:opacity-90"
            >
              로그인
            </button>
          </div>
        ) : (
          <>
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
                      <time className="text-sm text-clay/60">
                        {new Date(e.date).toLocaleString()}
                      </time>
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
                    <p className="mt-3 whitespace-pre-wrap leading-relaxed text-clay/90">
                      {e.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
};

export default Diary;
