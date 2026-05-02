import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Toaster } from 'sonner';
import { useWorkspaceState } from '../hooks/useWorkspaceState';
import useDiary from '../hooks/useDiary';
import LeftSidebar from './LeftSidebar/LeftSidebar';
import TopActionBar from './TopActionBar';
import MainWorkspace from './MainWorkspace/MainWorkspace';
import RightPanel from './RightPanel/RightPanel';
import PolishModal from './PolishModal/PolishModal';
import SettingsPanel from './SettingsPanel/SettingsPanel';
import type { DiaryEntry } from '../types/api.types';

export default function WorkspaceLayout() {
  const { state, patchState, selectDate, today } = useWorkspaceState();
  const [polishState, setPolishState] = useState<{
    open: boolean;
    source: string;
    diaryId: number | null;
    apply: (content: string) => void;
  }>({ open: false, source: '', diaryId: null, apply: () => undefined });

  const monthKey = useMemo(() => dayjs(state.selectedDate).format('YYYY-MM'), [state.selectedDate]);
  const {
    recentDiaries,
    dailyDiaries,
    myTags,
    monthlyDiaryCounts,
    saveDiaryMutation,
    deleteDiaryMutation,
  } = useDiary({
    selectedDateKey: state.selectedDate,
    monthKey,
    onSaveSuccess: async (data: any, _variables: any, { refreshAfterSave }: any) => {
      await refreshAfterSave(data?.diaryId);
      if (data?.diaryId) patchState({ selectedDiaryId: data.diaryId });
    },
  }) as any;

  const currentDiary = useMemo<DiaryEntry | null>(() => {
    if (state.selectedDiaryId) {
      return recentDiaries.find((diary: DiaryEntry) => (diary.diaryId ?? diary.id) === state.selectedDiaryId) ?? null;
    }
    return dailyDiaries[0] ?? null;
  }, [dailyDiaries, recentDiaries, state.selectedDiaryId]);

  const currentDiaryId = currentDiary?.diaryId ?? currentDiary?.id ?? null;
  const toggleAi = () =>
    patchState({ rightPanelMode: state.rightPanelMode === 'ai-comment' ? 'hidden' : 'ai-comment' });

  const selectDiary = (diary: DiaryEntry) => {
    const id = diary.diaryId ?? diary.id ?? null;
    patchState({
      selectedDiaryId: id,
      selectedDate: dayjs(diary.diaryDate ?? state.selectedDate).format('YYYY-MM-DD'),
      viewMode: 'diary',
      sidebarOpen: false,
    });
  };

  const sidebar = (
    <LeftSidebar
      state={state}
      diaries={recentDiaries}
      monthlyCounts={monthlyDiaryCounts}
      onPatchState={patchState}
      onSelectDate={selectDate}
      onSelectDiary={selectDiary}
      onToday={() => selectDate(today)}
    />
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {state.sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={() => patchState({ sidebarOpen: false })}
          aria-hidden="true"
        />
      ) : null}

      <div
        className={[
          'fixed z-50 h-full transition-transform duration-300 ease-in-out md:relative md:z-auto md:translate-x-0',
          state.sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        {state.sidebarOpen ? (
          <button
            type="button"
            onClick={() => patchState({ sidebarOpen: false })}
            className="absolute right-3 top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground md:hidden"
            aria-label="사이드바 닫기"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopActionBar
          viewMode={state.viewMode}
          rightPanelMode={state.rightPanelMode}
          onToggleSidebar={() => patchState({ sidebarOpen: !state.sidebarOpen })}
          onRequestPolish={() =>
            setPolishState({ open: true, source: currentDiary?.contentMd ?? '', diaryId: currentDiaryId, apply: () => undefined })
          }
          onToggleAi={toggleAi}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-hidden">
            {state.viewMode === 'settings' ? (
              <SettingsPanel />
            ) : (
              <MainWorkspace
                state={state}
                currentDiary={currentDiary}
                myTags={Array.isArray(myTags) ? myTags : []}
                isSaving={saveDiaryMutation.isPending}
                onPatchState={patchState}
                onSave={(payload) => saveDiaryMutation.mutate(payload)}
                onDelete={(diaryId) => deleteDiaryMutation.mutate({ diaryId })}
                onOpenAi={() => patchState({ rightPanelMode: 'ai-comment' })}
                onOpenPolish={(source, apply, diaryId) => setPolishState({ open: true, source, diaryId, apply })}
              />
            )}
          </div>
          {state.viewMode === 'diary' ? (
            <RightPanel
              open={state.rightPanelMode === 'ai-comment'}
              diaryId={currentDiaryId}
              onClose={() => patchState({ rightPanelMode: 'hidden' })}
            />
          ) : null}
        </div>
      </div>

      <PolishModal
        open={polishState.open}
        source={polishState.source}
        diaryId={polishState.diaryId}
        onClose={() => setPolishState((prev) => ({ ...prev, open: false }))}
        onApply={(content) => {
          polishState.apply(content);
          setPolishState((prev) => ({ ...prev, open: false }));
        }}
      />
      <Toaster position="bottom-right" />
    </div>
  );
}
