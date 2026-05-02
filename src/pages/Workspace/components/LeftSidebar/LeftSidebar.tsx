import { useCallback, useEffect, useRef } from 'react';
import { BarChart3, BookOpen, FileText, PenSquare, Search, Settings } from 'lucide-react';
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
  width: number;
  onWidthChange: (width: number) => void;
  isMobile?: boolean;
};

const tabs = [
  { id: 'diary', label: 'Diary', icon: FileText },
  { id: 'summary', label: 'Summary', icon: BarChart3 },
  { id: 'search', label: 'Search', icon: Search },
] as const;

export default function LeftSidebar({
  state,
  diaries,
  monthlyCounts,
  onPatchState,
  onSelectDate,
  onSelectDiary,
  onToday,
  width,
  onWidthChange,
  isMobile = false,
}: Props) {
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      if (isMobile) return;
      isDragging.current = true;
      startX.current = event.clientX;
      startWidth.current = width;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [isMobile, width],
  );

  useEffect(() => {
    if (isMobile) return undefined;

    const onMouseMove = (event: MouseEvent) => {
      if (!isDragging.current) return;
      const diff = event.clientX - startX.current;
      onWidthChange(Math.max(220, Math.min(360, startWidth.current + diff)));
    };

    const onMouseUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isMobile, onWidthChange]);

  const sidebarWidth = isMobile ? 'min(86vw, 320px)' : `${width}px`;

  return (
    <aside
      className="flex h-full bg-sidebar-bg"
      style={{ width: sidebarWidth, minWidth: isMobile ? undefined : '220px' }}
      aria-label="사이드바"
    >
      <div className="flex h-full flex-1 flex-col overflow-hidden border-r border-sidebar-border">
        <div className="flex shrink-0 items-center gap-2 border-b border-sidebar-border/60 px-4 py-4">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-serif text-sm font-semibold tracking-tight text-foreground">HeysoDiary</span>
        </div>

        <div className="shrink-0 px-3 pb-2 pt-3">
          <button
            type="button"
            onClick={onToday}
            className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]"
          >
            <PenSquare className="h-3.5 w-3.5" />
            + 오늘의 일기
          </button>
        </div>

        <div className="shrink-0 px-3 pb-2">
          <div className="flex rounded-md bg-muted/50 p-0.5">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = state.sidebarTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => onPatchState({ sidebarTab: tab.id })}
                  className={[
                    'flex flex-1 items-center justify-center gap-1 rounded px-2 py-1.5 text-[11px] font-medium transition-all',
                    active ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  ].join(' ')}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-3 py-2">
          {state.sidebarTab === 'diary' ? (
            <DiaryTab
              selectedDate={state.selectedDate}
              selectedMood={state.draftMood}
              diaries={diaries}
              monthlyCounts={monthlyCounts}
              selectedDiaryId={state.selectedDiaryId}
              onSelectDate={onSelectDate}
              onSelectDiary={onSelectDiary}
            />
          ) : state.sidebarTab === 'summary' ? (
            <SummaryTab diaries={diaries} />
          ) : (
            <SearchTab diaries={diaries} onSelectDiary={onSelectDiary} />
          )}
        </div>

        <div className="shrink-0 border-t border-sidebar-border/60 px-3 py-3">
          <button
            type="button"
            onClick={() => onPatchState({ viewMode: 'settings' })}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-3.5 w-3.5" />
            설정
          </button>
        </div>
      </div>

      {!isMobile ? (
        <div
          onMouseDown={onMouseDown}
          className="group relative w-1 shrink-0 cursor-col-resize bg-transparent transition-colors hover:bg-primary/40"
          role="separator"
          aria-label="사이드바 크기 조절"
        >
          <div className="absolute inset-y-0 -left-1 -right-1" />
        </div>
      ) : null}
    </aside>
  );
}
