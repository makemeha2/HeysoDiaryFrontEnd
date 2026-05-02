import MiniCalendar from './MiniCalendar';
import MonthDiaryList from './MonthDiaryList';
import WeatherWidget from './WeatherWidget';
import type { DiaryEntry } from '../../types/api.types';

type Props = {
  selectedDate: string;
  diaries: DiaryEntry[];
  monthlyCounts: Array<{ diaryDate?: string; date?: string; count?: number }>;
  selectedDiaryId: number | null;
  onSelectDate: (date: string) => void;
  onSelectDiary: (diary: DiaryEntry) => void;
};

export default function DiaryTab(props: Props) {
  return (
    <div className="space-y-4">
      <MiniCalendar selectedDate={props.selectedDate} monthlyCounts={props.monthlyCounts} onSelectDate={props.onSelectDate} />
      <MonthDiaryList diaries={props.diaries} selectedDiaryId={props.selectedDiaryId} onSelectDiary={props.onSelectDiary} />
      <WeatherWidget />
    </div>
  );
}
