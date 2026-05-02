import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  selectedDate: string;
  monthlyCounts: Array<{ diaryDate?: string; date?: string; count?: number }>;
  onSelectDate: (date: string) => void;
};

export default function MiniCalendar({ selectedDate, monthlyCounts, onSelectDate }: Props) {
  const selected = dayjs(selectedDate);
  const start = selected.startOf('month').startOf('week');
  const days = Array.from({ length: 42 }, (_, index) => start.add(index, 'day'));
  const countMap = new Map(
    monthlyCounts.map((item) => [dayjs(item.diaryDate ?? item.date).format('YYYY-MM-DD'), item.count ?? 1]),
  );

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={() => onSelectDate(selected.subtract(1, 'month').format('YYYY-MM-DD'))}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-semibold">{selected.format('YYYY.MM')}</span>
        <Button variant="ghost" size="icon" onClick={() => onSelectDate(selected.add(1, 'month').format('YYYY-MM-DD'))}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[11px] text-muted-foreground">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const key = date.format('YYYY-MM-DD');
          const active = key === selectedDate;
          const inMonth = date.month() === selected.month();
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelectDate(key)}
              className={[
                'relative h-8 rounded-md text-xs transition hover:bg-muted',
                active ? 'bg-primary text-primary-foreground' : 'text-foreground',
                !inMonth ? 'opacity-35' : '',
              ].join(' ')}
            >
              {date.date()}
              {countMap.has(key) ? <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-current" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
