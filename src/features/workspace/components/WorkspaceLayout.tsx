import dayjs from 'dayjs';
import { useCallback, useState } from 'react';
import { Toaster } from 'sonner';
import { useWorkspaceState } from '../hooks/useWorkspaceState';
import { useWorkspaceDiary } from '../hooks/useWorkspaceDiary';
import { usePolishModal } from '../hooks/usePolishModal';
import LeftSidebar from '@features/workspace/components/LeftSidebar/LeftSidebar';
import MobileSidebarShell from '@features/workspace/components/MobileSidebarShell';
import TopActionBar from '@features/workspace/components/TopActionBar';
import MainWorkspace from '@features/workspace/components/MainWorkspace/MainWorkspace';
import RightPanel from '@features/workspace/components/RightPanel/RightPanel';
import PolishModal from '@features/workspace/components/PolishModal/PolishModal';
import SettingsPanel from '@features/workspace/components/SettingsPanel/SettingsPanel';
import type { DiaryEntry } from '../types/api.types';
import { getDiaryId } from '../hooks/useDiary';

const WorkspaceLayout = () => {
  const { state, patchState, selectDate, today } = useWorkspaceState();
  const [sidebarWidth, setSidebarWidth] = useState(260);

  const {
    myTags,
    currentDiary,
    isSaving,
    save,
    remove,
  } = useWorkspaceDiary(state, patchState);

  const { polishState, openPolish, closePolish, applyPolished } = usePolishModal();

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
      draftMood: diary.moodId ?? 'none',
      viewMode: 'diary',
      sidebarOpen: false,
      pendingDateAutoSelect: null,
    });
  }, [patchState, state.selectedDate]);

  const closeRightPanel = useCallback(() => {
    patchState({ rightPanelMode: 'hidden' });
  }, [patchState]);

  const closeSettingsPanel = useCallback(() => {
    patchState({ viewMode: 'diary' });
  }, [patchState]);

  const openAiCommentPanel = useCallback(() => {
    patchState({ rightPanelMode: 'ai-comment' });
  }, [patchState]);

  const selectToday = useCallback(() => {
    selectDate(today);
  }, [selectDate, today]);

  const resetHome = useCallback(() => {
    patchState({
      selectedDate: today,
      viewMode: 'diary',
      rightPanelMode: 'hidden',
      sidebarTab: 'diary',
      sidebarOpen: false,
      selectedDiaryId: null,
      draftMood: null,
      pendingDateAutoSelect: null,
    });
  }, [patchState, today]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      <MobileSidebarShell open={state.sidebarOpen} onClose={closeSidebar}>
        <LeftSidebar
          state={state}
          onPatchState={patchState}
          onSelectDate={selectDate}
          onSelectDiary={selectDiary}
          onToday={selectToday}
          onResetHome={resetHome}
          width={sidebarWidth}
          onWidthChange={setSidebarWidth}
          isMobile={state.sidebarOpen}
        />
      </MobileSidebarShell>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <TopActionBar
          viewMode={state.viewMode}
          rightPanelMode={state.rightPanelMode}
          onToggleSidebar={toggleSidebar}
          onToggleAi={toggleAiCommentPanel}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
          <div className="min-w-0 flex-1 overflow-hidden">
            {state.viewMode === 'settings' ? (
              <SettingsPanel onClose={closeSettingsPanel} />
            ) : (
              <MainWorkspace
                state={state}
                currentDiary={currentDiary}
                myTags={Array.isArray(myTags) ? myTags : []}
                isSaving={isSaving}
                onPatchState={patchState}
                onSave={save}
                onDelete={remove}
                onOpenAi={openAiCommentPanel}
                onOpenPolish={openPolish}
              />
            )}
          </div>
          {state.viewMode === 'diary' ? (
            <RightPanel
              mode={state.rightPanelMode}
              diaryId={getDiaryId(currentDiary)}
              onClose={closeRightPanel}
            />
          ) : null}
        </div>
      </div>

      <PolishModal
        open={polishState.open}
        source={polishState.source}
        diaryId={polishState.diaryId}
        onClose={closePolish}
        onApply={applyPolished}
      />
      <Toaster position="bottom-right" />
    </div>
  );
};

export default WorkspaceLayout;
