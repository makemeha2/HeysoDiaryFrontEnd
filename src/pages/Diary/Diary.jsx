import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Dialog from '@radix-ui/react-dialog';
import DiaryEditDialog from './components/DiaryEditDialog.jsx';
import DiaryCalender from './components/DiaryCalender.jsx';
import dayjs from 'dayjs';
import { authFetch } from '../../lib/apiClient.js';
import { useAuthStore } from '../../stores/authStore.js';

const toDateKey = (date) => {
  const d = dayjs(date);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
};

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 20;

const Diary = () => {
  const [isNewDiaryDialogOpen, setIsNewDiaryDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const auth = useAuthStore((s) => s.auth);
  const authChecked = useAuthStore((s) => s.authChecked);

  const isSignedIn = authChecked && !!auth;
  const selectedDateKey = toDateKey(selectedDate);

  // 우측 리스트 조회 (최근 다이어리 목록)
  const fetchDiaries = async ({ signal, page = DEFAULT_PAGE, size = DEFAULT_SIZE }) => {
    const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
    const res = await authFetch(`/api/diary?${query}`, { method: 'GET', signal });

    const diaries = res.data?.diaries;
    if (!Array.isArray(diaries)) return [];

    return diaries.map((item) => ({
      id: item.diaryId ?? item.id,
      title: item.title ?? '',
      content: item.contentMd ?? item.content ?? '',
      date: item.diaryDate ?? item.date,
      raw: item,
    }));
  };

  const {
    data: diaries = [],
    isLoading: isDiariesLoading,
    isError: isDiariesError,
    error: diariesError,
  } = useQuery({
    queryKey: ['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE],
    queryFn: ({ signal }) => fetchDiaries({ signal, page: DEFAULT_PAGE, size: DEFAULT_SIZE }),
    enabled: isSignedIn,
    staleTime: 0,
  });

  // 좌측 하단: 선택한 날짜의 다이어리 목록
  const {
    data: dailyDiaries = [],
    isLoading: isDailyDiariesLoading,
    isError: isDailyDiariesError,
  } = useQuery({
    queryKey: ['diaryDaily', selectedDateKey],
    queryFn: async ({ signal }) => {
      const res = await authFetch(`/api/diary/daily?day=${selectedDateKey}`, { signal });
      const diaries = res.data?.diaries;
      return Array.isArray(diaries) ? diaries : [];
    },
    enabled: isSignedIn && !!selectedDateKey,
    staleTime: 0,
  });

  // “최근 순”으로 정렬된 목록 (캘린더 & 우측 Recent Entries 공용)
  const recentDiaries = useMemo(() => {
    return [...diaries].sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [diaries]);

  // 로컬 캐시에서 다이어리를 제거합니다. (서버 삭제는 추후 TODO)
  const removeDiaryFromCache = (diaryId) => {
    queryClient.setQueryData(['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE], (prev = []) =>
      prev.filter((diary) => diary.id !== diaryId),
    );
  };

  // 로그인 여부에 따라 새 글 다이얼로그를 열거나 로그인 페이지로 이동합니다.
  const handleNewDiaryDialogChange = (nextOpen) => {
    if (nextOpen && !isSignedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }
    setIsNewDiaryDialogOpen(nextOpen);
  };

  const handleDailyDiaryClick = (diary) => {
    // TODO: 추후 상세 보기 화면으로 이동
    console.log('View diary', diary);
  };

  const goToLogin = () => {
    navigate('/login', { state: { from: location } });
  };

  const handleDiaryDoubleClick = (diary) => {
    // TODO: 추후 상세 보기 화면으로 이동
    console.log('Open diary detail', diary);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="bg-white/70 rounded-2xl p-6 shadow-soft border border-sand/40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-clay/60">Capture a moment</p>
            <h2 className="text-xl font-semibold">New Entry</h2>
          </div>

          <Dialog.Root open={isNewDiaryDialogOpen} onOpenChange={handleNewDiaryDialogChange}>
            <Dialog.Trigger asChild>
              <button className="rounded-full bg-amber text-white px-4 py-2 text-sm font-medium hover:opacity-95 active:opacity-90">
                New
              </button>
            </Dialog.Trigger>
            <DiaryEditDialog onClose={() => setIsNewDiaryDialogOpen(false)} />
          </Dialog.Root>
        </div>

        <div className="mt-4">
          <DiaryCalender
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onSingleEntryDoubleClick={handleDiaryDoubleClick}
          />
        </div>

        {selectedDateKey && (
          <div className="mt-6 rounded-xl border border-sand/40 bg-white/70 p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="text-sm font-semibold text-clay/80">{selectedDateKey} 작성 글</h3>
            </div>

            {!isSignedIn ? (
              <p className="text-sm text-clay/60">
                로그인 후 선택한 날짜의 글을 확인할 수 있습니다.
              </p>
            ) : isDailyDiariesLoading ? (
              <p className="text-sm text-clay/60">불러오는 중입니다...</p>
            ) : isDailyDiariesError ? (
              <p className="text-sm text-red-600">일기를 불러오지 못했습니다.</p>
            ) : dailyDiaries.length === 0 ? (
              <p className="text-sm text-clay/60">해당 날짜의 글이 없습니다.</p>
            ) : (
              <ul className="space-y-2">
                {dailyDiaries.map((diary) => (
                  <li
                    key={diary.diaryId ?? diary.id}
                    className="cursor-pointer rounded-lg border border-sand/40 bg-white/90 px-3 py-2 text-sm text-clay/90 hover:bg-amber/10"
                    onClick={() => handleDailyDiaryClick(diary)}
                    title={diary.title}
                  >
                    <span className="truncate block">{diary.title}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Entries</h2>

        {!authChecked ? (
          <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/70">
            인증 상태를 확인하는 중입니다...
          </div>
        ) : !isSignedIn ? (
          <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/80 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="font-semibold">로그인을 하면 내가 쓴 글이 보입니다.</p>
              <p className="text-sm text-clay/60 mt-1">
                작성한 다이어리를 확인하려면 로그인해주세요.
              </p>
            </div>
            <button
              onClick={goToLogin}
              className="self-start rounded-full bg-amber text-white px-4 py-2 text-sm font-medium hover:opacity-95 active:opacity-90"
            >
              로그인
            </button>
          </div>
        ) : (
          <>
            {isDiariesLoading && (
              <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/70">
                Loading diaries...
              </div>
            )}

            {isDiariesError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
                {diariesError?.message || 'Failed to load diaries.'}
              </div>
            )}

            {!isDiariesLoading && !isDiariesError && recentDiaries.length === 0 && (
              <div className="rounded-2xl border border-sand/40 bg-white/60 p-6 text-clay/70">
                No diaries yet. Your first note will appear here.
              </div>
            )}

            <ul className="space-y-3">
              {recentDiaries.map((diary) => (
                <li
                  key={diary.id}
                  className="group rounded-2xl border border-sand/50 bg-white/70 p-5 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{diary.title}</h3>
                      <time className="text-sm text-clay/60">
                        {new Date(diary.date).toLocaleString()}
                      </time>
                    </div>
                    <button
                      onClick={() => removeDiaryFromCache(diary.id)}
                      className="text-sm text-clay/60 hover:text-clay/90"
                      title="Delete diary"
                    >
                      Delete
                    </button>
                  </div>

                  {diary.content && (
                    <p className="mt-3 whitespace-pre-wrap leading-relaxed text-clay/90">
                      {diary.content}
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
