import dayjs from 'dayjs';
import { useCallback, useMemo, useState } from 'react';
import { X } from 'lucide-react';
import { Toaster } from 'sonner';
import { useWorkspaceState } from '../hooks/useWorkspaceState';
import useDiary from '../hooks/useDiary';
import LeftSidebar from '@workspace/components/LeftSidebar/LeftSidebar';
import TopActionBar from '@workspace/components/TopActionBar';
import MainWorkspace from '@workspace/components/MainWorkspace/MainWorkspace';
import RightPanel from '@workspace/components/RightPanel/RightPanel';
import PolishModal from '@workspace/components/PolishModal/PolishModal';
import SettingsPanel from '@workspace/components/SettingsPanel/SettingsPanel';
import type { DiaryEntry } from '../types/api.types';
import type { SaveDiaryPayload } from '../hooks/useDiary';

type PolishState = {
  open: boolean;
  source: string;
  diaryId: number | null;
  apply: (content: string) => void;
};

const getDiaryId = (diary: DiaryEntry | null): number | null => diary?.diaryId ?? diary?.id ?? null;

const emptyPolishState: PolishState = {
  open: false,
  source: '',
  diaryId: null,
  apply: () => undefined,
};

const WorkspaceLayout = () => {
  const { state, patchState, selectDate, today } = useWorkspaceState();
  const [polishState, setPolishState] = useState<PolishState>(emptyPolishState);
  const [sidebarWidth, setSidebarWidth] = useState(260);

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
    onSaveSuccess: async (data, _variables, { refreshAfterSave }) => {
      await refreshAfterSave(data?.diaryId);
      if (data?.diaryId) patchState({ selectedDiaryId: data.diaryId });
    },
  });

  const currentDiary = useMemo<DiaryEntry | null>(() => {
    if (state.selectedDiaryId) {
      return recentDiaries.find((diary) => getDiaryId(diary) === state.selectedDiaryId) ?? null;
    }
    return dailyDiaries[0] ?? null;
  }, [dailyDiaries, recentDiaries, state.selectedDiaryId]);

  const currentDiaryId = getDiaryId(currentDiary);

  const closeSidebar = useCallback(() => {
    patchState({ sidebarOpen: false });
  }, [patchState]);

  const toggleSidebar = useCallback(() => {
    patchState({ sidebarOpen: !state.sidebarOpen });
  }, [patchState, state.sidebarOpen]);

  const toggleAiCommentPanel = useCallback(() => {
    patchState({ rightPanelMode: state.rightPanelMode === 'ai-comment' ? 'hidden' : 'ai-comment' });
  }, [patchState, state.rightPanelMode]);

  const selectDiary = useCallback((diary: DiaryEntry) => {
    patchState({
      selectedDiaryId: getDiaryId(diary),
      selectedDate: dayjs(diary.diaryDate ?? state.selectedDate).format('YYYY-MM-DD'),
      viewMode: 'diary',
      sidebarOpen: false,
    });
  }, [patchState, state.selectedDate]);

  const openPolishModal = useCallback(
    (source: string, apply: (content: string) => void, diaryId: number | null) => {
      setPolishState({ open: true, source, diaryId, apply });
    },
    [],
  );

  const openCurrentDiaryPolishModal = useCallback(() => {
    openPolishModal(currentDiary?.contentMd ?? '', () => undefined, currentDiaryId);
  }, [currentDiary?.contentMd, currentDiaryId, openPolishModal]);

  const closePolishModal = useCallback(() => {
    setPolishState((previousPolishState) => ({ ...previousPolishState, open: false }));
  }, []);

  const applyPolishedContent = useCallback((content: string) => {
    polishState.apply(content);
    setPolishState((previousPolishState) => ({ ...previousPolishState, open: false }));
  }, [polishState]);

  const closeRightPanel = useCallback(() => {
    patchState({ rightPanelMode: 'hidden' });
  }, [patchState]);

  const closeSettingsPanel = useCallback(() => {
    patchState({ viewMode: 'diary' });
  }, [patchState]);

  const openAiCommentPanel = useCallback(() => {
    patchState({ rightPanelMode: 'ai-comment' });
  }, [patchState]);

  const handleSave = useCallback((payload: SaveDiaryPayload) => {
    saveDiaryMutation.mutate(payload);
  }, [saveDiaryMutation]);

  const handleDelete = useCallback((diaryId: number) => {
    deleteDiaryMutation.mutate({ diaryId });
  }, [deleteDiaryMutation]);

  const selectToday = useCallback(() => {
    selectDate(today);
  }, [selectDate, today]);

  const leftSidebarProps = {
    state,
    diaries: recentDiaries,
    monthlyCounts: monthlyDiaryCounts,
    onPatchState: patchState,
    onSelectDate: selectDate,
    onSelectDiary: selectDiary,
    onToday: selectToday,
    width: sidebarWidth,
    onWidthChange: setSidebarWidth,
    isMobile: state.sidebarOpen,
  };

  const sidebar = (
    <LeftSidebar {...leftSidebarProps} />
  );

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {state.sidebarOpen ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={closeSidebar}
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
            onClick={closeSidebar}
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
          onToggleSidebar={toggleSidebar}
          onRequestPolish={openCurrentDiaryPolishModal}
          onToggleAi={toggleAiCommentPanel}
        />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-hidden">
            {state.viewMode === 'settings' ? (
              <SettingsPanel onClose={closeSettingsPanel} />
            ) : (
              <MainWorkspace
                state={state}
                currentDiary={currentDiary}
                myTags={Array.isArray(myTags) ? myTags : []}
                isSaving={Boolean(saveDiaryMutation.isPending)}
                onPatchState={patchState}
                onSave={handleSave}
                onDelete={handleDelete}
                onOpenAi={openAiCommentPanel}
                onOpenPolish={openPolishModal}
              />
            )}
          </div>
          {state.viewMode === 'diary' ? (
            <div className="hidden h-full md:flex">
              <RightPanel
                mode={state.rightPanelMode}
                diaryId={currentDiaryId}
                onClose={closeRightPanel}
              />
            </div>
          ) : null}
        </div>

        {state.viewMode === 'diary' && state.rightPanelMode !== 'hidden' ? (
          <div className="flex h-[50vh] flex-col border-t border-border/60 bg-surface md:hidden">
            <RightPanel
              mode={state.rightPanelMode}
              diaryId={currentDiaryId}
              onClose={closeRightPanel}
            />
          </div>
        ) : null}
      </div>

      <PolishModal
        open={polishState.open}
        source={polishState.source}
        diaryId={polishState.diaryId}
        onClose={closePolishModal}
        onApply={applyPolishedContent}
      />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default WorkspaceLayout;
