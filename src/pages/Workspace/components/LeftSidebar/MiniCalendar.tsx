import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
  selectedDate: string;
  monthlyCounts: Array<{ diaryDate?: string; date?: string; count?: number }>;
  onSelectDate: (date: string) => void;
};

const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

const MiniCalendar = ({ selectedDate, monthlyCounts, onSelectDate }: Props) => {
  const selected = dayjs(selectedDate);
  const today = dayjs();
  const [viewDate, setViewDate] = useState(() => selected.startOf('month'));

  useEffect(() => {
    setViewDate(selected.startOf('month'));
  }, [selectedDate]);

  const cells = useMemo(() => {
    const firstDay = viewDate.startOf('month').day();
    const daysInMonth = viewDate.daysInMonth();
    const nextCells: Array<number | null> = [
      ...Array.from({ length: firstDay }, () => null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
    ];
    while (nextCells.length % 7 !== 0) nextCells.push(null);
    return nextCells;
  }, [viewDate]);

  const countMap = useMemo(
    () =>
      new Map(
        monthlyCounts.map((item) => [dayjs(item.diaryDate ?? item.date).format('YYYY-MM-DD'), item.count ?? 1]),
      ),
    [monthlyCounts],
  );

  const prevMonth = () => setViewDate((value) => value.subtract(1, 'month'));
  const nextMonth = () => setViewDate((value) => value.add(1, 'month'));

  return (
    <div className="select-none">
      <div className="mb-2 flex items-center justify-between px-0.5">
        <button
          type="button"
          onClick={prevMonth}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="이전 달"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <span className="text-xs font-medium text-foreground">{viewDate.format('YYYY년 M월')}</span>
        <button
          type="button"
          onClick={nextMonth}
          className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="다음 달"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7">
        {dayNames.map((dayName, index) => (
          <div
            key={dayName}
            className={[
              'pb-1 text-center text-[10px] font-medium',
              index === 0 ? 'text-destructive/70' : 'text-muted-foreground',
            ].join(' ')}
          >
            {dayName}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, index) => {
          if (day === null) return <div key={`empty-${index}`} />;

          const date = viewDate.date(day);
          const dateKey = date.format('YYYY-MM-DD');
          const isSelected = dateKey === selectedDate;
          const isToday = date.isSame(today, 'day');
          const hasEntry = countMap.has(dateKey);
          const isSunday = index % 7 === 0;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => onSelectDate(dateKey)}
              className={[
                'relative flex h-7 w-full flex-col items-center justify-center rounded text-[11px] transition-colors',
                isSunday ? 'text-destructive/70' : 'text-foreground',
                isSelected
                  ? 'bg-primary font-semibold text-primary-foreground'
                  : isToday
                    ? 'bg-muted font-semibold ring-1 ring-primary/40'
                    : 'hover:bg-muted',
              ].join(' ')}
              aria-label={dateKey}
              aria-pressed={isSelected}
            >
              {day}
              {hasEntry && !isSelected ? (
                <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary/60" />
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
