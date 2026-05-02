import { BookOpen, CalendarDays, FileSearch, ListChecks, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DiaryTab from './DiaryTab';
import SearchTab from './SearchTab';
import SummaryTab from './SummaryTab';
import type { DiaryEntry } from '../../types/api.types';
import type { WorkspaceState } from '../../types/workspace.types';

type Props = {
  state: WorkspaceState;
  diaries: DiaryEntry[];
  monthlyCounts: Array<{ diaryDate?: string; date?: string; count?: number }>;
  onPatchState: (patch: Partial<WorkspaceState>) => void;
  onSelectDate: (date: string) => void;
  onSelectDiary: (diary: DiaryEntry) => void;
  onToday: () => void;
};

const tabs = [
  { id: 'diary', label: 'Diary', icon: CalendarDays },
  { id: 'summary', label: 'Summary', icon: ListChecks },
  { id: 'search', label: 'Search', icon: FileSearch },
] as const;

export default function LeftSidebar({ state, diaries, monthlyCounts, onPatchState, onSelectDate, onSelectDiary, onToday }: Props) {
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-card p-4">
      <div className="flex items-center gap-2 text-base font-semibold">
        <BookOpen className="h-5 w-5 text-primary" />
        HeysoDiary
      </div>

      <Button className="mt-5 w-full justify-start" onClick={onToday}>
        + 오늘의 일기
      </Button>

      <div className="mt-4 grid grid-cols-3 rounded-lg bg-muted p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onPatchState({ sidebarTab: tab.id })}
              className={[
                'flex h-9 items-center justify-center gap-1 rounded-md text-xs transition',
                state.sidebarTab === tab.id ? 'bg-card font-semibold shadow-sm' : 'text-muted-foreground',
              ].join(' ')}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto">
        {state.sidebarTab === 'diary' ? (
          <DiaryTab
            selectedDate={state.selectedDate}
            diaries={diaries}
            monthlyCounts={monthlyCounts}
            selectedDiaryId={state.selectedDiaryId}
            onSelectDate={onSelectDate}
            onSelectDiary={onSelectDiary}
          />
        ) : state.sidebarTab === 'summary' ? (
          <SummaryTab />
        ) : (
          <SearchTab diaries={diaries} onSelectDiary={onSelectDiary} />
        )}
      </div>

      <Button variant="ghost" className="mt-4 w-full justify-start" onClick={() => onPatchState({ viewMode: 'settings' })}>
        <Settings className="h-4 w-4" />
        설정
      </Button>
    </aside>
  );
}
