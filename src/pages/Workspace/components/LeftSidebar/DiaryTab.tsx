import MiniCalendar from './MiniCalendar';
import MonthDiaryList from './MonthDiaryList';
import WeatherWidget from './WeatherWidget';
import type { MoodId } from '../../lib/moodCatalog';
import type { DiaryEntry } from '../../types/api.types';

type Props = {
  selectedDate: string;
  selectedMood: MoodId | null;
  diaries: DiaryEntry[];
  monthlyCounts: Array<{ diaryDate?: string; date?: string; count?: number }>;
  selectedDiaryId: number | null;
  onSelectDate: (date: string) => void;
  onSelectDiary: (diary: DiaryEntry) => void;
};

export default function DiaryTab({
  selectedDate,
  selectedMood,
  diaries,
  monthlyCounts,
  selectedDiaryId,
  onSelectDate,
  onSelectDiary,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-3 overflow-hidden">
      <section className="shrink-0" aria-label="달력">
        <MiniCalendar selectedDate={selectedDate} monthlyCounts={monthlyCounts} onSelectDate={onSelectDate} />
      </section>

      <div className="h-px shrink-0 bg-sidebar-border/60" />

      <section className="flex min-h-0 flex-1 flex-col overflow-hidden" aria-label="이번 달 일기">
        <MonthDiaryList
          selectedDate={selectedDate}
          selectedMood={selectedMood}
          diaries={diaries}
          selectedDiaryId={selectedDiaryId}
          onSelectDiary={onSelectDiary}
        />
      </section>

      <div className="h-px shrink-0 bg-sidebar-border/60" />

      <section className="shrink-0" aria-label="오늘 날씨">
        <div className="mb-1.5 flex items-center px-1">
          <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">오늘 날씨</span>
        </div>
        <WeatherWidget />
      </section>
    </div>
  );
}
