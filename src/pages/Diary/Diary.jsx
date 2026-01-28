import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import DiaryEditDialog from './components/DiaryEditDialog.jsx';
import DiaryViewDialog from './components/DiaryViewDialog.jsx';
import DiaryCalender from './components/DiaryCalender.jsx';
import { formatDate, formatDateTime } from '../../lib/dateFormatters.js';
import { useAuthStore } from '../../stores/authStore.js';
import useDiary, { DEFAULT_PAGE, DEFAULT_SIZE } from './useDiary.jsx';

const Diary = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingDiaryId, setEditingDiaryId] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewDiaryId, setViewDiaryId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  const auth = useAuthStore((s) => s.auth);
  const authChecked = useAuthStore((s) => s.authChecked);
  const isSignedIn = authChecked && !!auth;

  const selectedDateKey = formatDate(selectedDate);

  const { diariesQuery, dailyDiariesQuery, removeDiaryFromCache } = useDiary({
    page: DEFAULT_PAGE,
    size: DEFAULT_SIZE,
    selectedDateKey,
  });

  // 우측 다이어리 목록
  const diaries = diariesQuery.data ?? [];
  const isDiariesLoading = diariesQuery.isLoading;
  const isDiariesError = diariesQuery.isError;
  const diariesError = diariesQuery.error;

  // 좌측 하단: 선택한 날짜의 다이어리 목록
  const dailyDiaries = dailyDiariesQuery.data ?? [];
  const isDailyDiariesLoading = dailyDiariesQuery.isLoading;
  const isDailyDiariesError = dailyDiariesQuery.isError;

  // “최근 순”으로 정렬된 목록 (캘린더 & 우측 Recent Entries 공용)
  const recentDiaries = useMemo(() => {
    return [...diaries].sort((a, b) => new Date(b.diaryDate) - new Date(a.diaryDate));
  }, [diaries]);

  // 로그인 여부에 따라 새 글 다이얼로그를 열거나 로그인 페이지로 이동합니다.
  const handleEditDialogChange = (nextOpen) => {
    if (nextOpen && !isSignedIn) {
      navigate('/login', { state: { from: location } });
      return;
    }

    if (!nextOpen) {
      setEditingDiaryId(null);
    }

    setIsEditDialogOpen(nextOpen);
  };

  // 캘런더 하단의 목록에서 날짜를 선택한 경우
  const handleDailyDiaryClick = (diary) => {
    if (!diary?.diaryId) return;

    setViewDiaryId(diary.diaryId);
    setIsViewDialogOpen(true);
  };

  // View 모달팝업 열기/닫기
  const handleViewDialogChange = (nextOpen) => {
    if (!nextOpen) {
      setViewDiaryId(null);
    }
    setIsViewDialogOpen(nextOpen);
  };

  // 저장 후 View 화면으로 이동
  const handleEditSaved = (savedDiaryId) => {
    handleEditDialogChange(false);
    if (!savedDiaryId) return;
    setViewDiaryId(savedDiaryId);
    setIsViewDialogOpen(true);
  };

  const goToLogin = () => {
    navigate('/login', { state: { from: location } });
  };

  // View화면에서 Edit화면으로 이동
  const handleEditFromView = (diaryId) => {
    if (!diaryId) return;
    setIsViewDialogOpen(false);
    setEditingDiaryId(diaryId);
    setIsEditDialogOpen(true);
  };

  // 캘린더 더블클릭 이벤트
  const handleDiaryDoubleClick = (diary) => {
    // TODO: 추후 상세 보기 화면으로 이동
    console.log('Open diary detail', diary);
  };

  return (
    <>
      <Dialog.Root open={isViewDialogOpen} onOpenChange={handleViewDialogChange}>
        {isViewDialogOpen && (
          <DiaryViewDialog
            diaryId={viewDiaryId}
            onClose={() => handleViewDialogChange(false)}
            onEdit={handleEditFromView}
          />
        )}
      </Dialog.Root>

      <Dialog.Root open={isEditDialogOpen} onOpenChange={handleEditDialogChange}>
        {isEditDialogOpen && (
          <DiaryEditDialog
            diaryId={editingDiaryId}
            isOpen={isEditDialogOpen}
            onClose={() => handleEditDialogChange(false)}
            onView={handleEditSaved}
          />
        )}
      </Dialog.Root>

      <div className="grid gap-8 md:grid-cols-[3fr_7fr]">
        <section className="bg-white/70 rounded-2xl p-6 shadow-soft border border-sand/40">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-clay/60">Capture a moment</p>
              {/* <h2 className="text-xl font-semibold">New Entry</h2> */}
            </div>

            <button
              className="rounded-full bg-amber text-white px-4 py-2 text-sm font-medium hover:opacity-95 active:opacity-90"
              onClick={() => {
                setEditingDiaryId(null);
                handleEditDialogChange(true);
              }}
            >
              New
            </button>
          </div>

          <div className="mt-4">
            <DiaryCalender
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              onSingleDiaryDoubleClick={handleDiaryDoubleClick}
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
          {/* <h2 className="text-xl font-semibold"></h2> */}

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
                    key={diary.diaryId}
                    className="group rounded-2xl border border-sand/50 bg-white/70 p-5 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3
                          className="text-lg font-semibold mb-1 cursor-pointer"
                          onClick={() => handleDailyDiaryClick(diary)}
                        >
                          {diary.title}
                        </h3>
                        <time className="text-sm text-clay/60">
                          {formatDateTime(diary.diaryDate)}
                        </time>
                      </div>
                      <button
                        onClick={() => removeDiaryFromCache(diary.diaryId)}
                        className="text-sm text-clay/60 hover:text-clay/90"
                        title="Delete diary"
                      >
                        Delete
                      </button>
                    </div>

                    {diary.contentMd && (
                      <p className="mt-3 whitespace-pre-wrap leading-relaxed max-h-[96px] text-clay/90 overflow-hidden">
                        {diary.contentMd}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </>
  );
};

export default Diary;
