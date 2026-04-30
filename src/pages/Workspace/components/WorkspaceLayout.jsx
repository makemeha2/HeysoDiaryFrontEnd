import dayjs from 'dayjs';
import { Menu, PenLine } from 'lucide-react';
import { Toaster } from 'sonner';

import useDiary from '@pages/Diary/useDiary.jsx';

import { useMoodStorage } from '../hooks/useMoodStorage.js';
import { useWorkspaceState } from '../hooks/useWorkspaceState.js';
import LeftSidebar from './LeftSidebar/LeftSidebar.jsx';
import MainWorkspace from './MainWorkspace/MainWorkspace.jsx';
import RightPanel from './RightPanel/RightPanel.jsx';
import SettingsPanel from './SettingsPanel/SettingsPanel.jsx';
import TopActionBar from './TopActionBar.jsx';
import { ConfirmProvider } from './modals/useConfirm.jsx';

const WorkspaceLayout = () => {
  const state = useWorkspaceState();
  const monthKey = dayjs(state.selectedDate).format('YYYY-MM');
  const moodStorage = useMoodStorage();
  const diary = useDiary({
    page: 1,
    // TODO: Replace the fixed client-side list cap with pagination or infinite scroll.
    size: 100,
    selectedDateKey: state.selectedDate,
    monthKey,
  });

  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-linen text-clay">
        <TopActionBar state={state} diary={diary} />

        <div className="flex min-h-[calc(100vh-64px)]">
          <LeftSidebar state={state} diary={diary} moodStorage={moodStorage} />

          <main className="min-w-0 flex-1">
            <button
              type="button"
              className="fixed bottom-5 right-5 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber text-white shadow-soft md:hidden"
              aria-label="오늘 일기 쓰기"
              onClick={() => {
                state.setSelectedDate(dayjs().format('YYYY-MM-DD'));
                state.setViewMode('diary');
              }}
            >
              <PenLine className="h-5 w-5" />
            </button>

            <button
              type="button"
              className="fixed left-4 top-4 z-40 inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-white text-clay shadow-soft md:hidden"
              aria-label="사이드바 열기"
              onClick={() => state.setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {state.viewMode === 'settings' ? (
              <SettingsPanel />
            ) : (
              <MainWorkspace state={state} diary={diary} moodStorage={moodStorage} />
            )}
          </main>

          <RightPanel state={state} diary={diary} moodStorage={moodStorage} />
        </div>
        <Toaster position="bottom-right" />
      </div>
    </ConfirmProvider>
  );
};

export default WorkspaceLayout;
