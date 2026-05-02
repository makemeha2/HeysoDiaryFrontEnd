import dayjs from 'dayjs';
import { useMemo, useState } from 'react';
import { Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
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

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <div className="hidden lg:block">
        <LeftSidebar
          state={state}
          diaries={recentDiaries}
          monthlyCounts={monthlyDiaryCounts}
          onPatchState={patchState}
          onSelectDate={selectDate}
          onSelectDiary={selectDiary}
          onToday={() => selectDate(today)}
        />
      </div>

      {state.sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={() => patchState({ sidebarOpen: false })}>
          <div className="h-full" onClick={(event) => event.stopPropagation()}>
            <LeftSidebar
              state={state}
              diaries={recentDiaries}
              monthlyCounts={monthlyDiaryCounts}
              onPatchState={patchState}
              onSelectDate={selectDate}
              onSelectDiary={selectDiary}
              onToday={() => selectDate(today)}
            />
          </div>
        </div>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <TopActionBar
          viewMode={state.viewMode}
          onOpenSidebar={() => patchState({ sidebarOpen: true })}
          onOpenPolish={() => setPolishState({ open: true, source: currentDiary?.contentMd ?? '', diaryId: currentDiaryId, apply: () => undefined })}
          onToggleAi={toggleAi}
          onSettings={() => patchState({ viewMode: 'settings' })}
        />
        <div className="flex min-h-0 flex-1">
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
          <RightPanel open={state.rightPanelMode === 'ai-comment'} diaryId={currentDiaryId} onClose={() => patchState({ rightPanelMode: 'hidden' })} />
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
      <Button className="fixed bottom-4 right-4 lg:hidden" onClick={() => patchState({ rightPanelMode: 'ai-comment' })}>
        AI
      </Button>
    </div>
  );
}
