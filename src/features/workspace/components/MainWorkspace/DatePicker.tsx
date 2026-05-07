import { useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { dayNames, formatDisplayDate, parseYMD, toYMD } from '@lib/dateFormatters';

type Props = {
  value: string;
  entryDates: Set<string>;
  onChange: (date: string) => void;
};

// 날짜 선택 팝오버 — 일기 작성 날짜와 일기 존재 여부를 함께 표시
const DatePicker = ({ value, entryDates, onChange }: Props) => {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseYMD(value));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewDate(parseYMD(value));
  }, [value]);

  useEffect(() => {
    if (!open) return undefined;

    // 팝오버 바깥 클릭 시 달력을 닫는다.
    const onMouseDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const today = toYMD(new Date());
  const cells = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    const nextCells: Array<{ date: Date; outside: boolean }> = [];

    // 이전달/다음달 날짜를 채워 항상 6주 그리드를 유지한다.
    for (let index = firstDay - 1; index >= 0; index -= 1) {
      nextCells.push({ date: new Date(year, month - 1, daysInPrevMonth - index), outside: true });
    }
    for (let day = 1; day <= daysInMonth; day += 1) {
      nextCells.push({ date: new Date(year, month, day), outside: false });
    }
    let nextDay = 1;
    while (nextCells.length < 42) {
      nextCells.push({ date: new Date(year, month + 1, nextDay), outside: true });
      nextDay += 1;
    }
    return nextCells;
  }, [month, year]);

  const selectDate = (date: Date) => {
    onChange(toYMD(date));
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="-mx-1.5 -my-1 flex items-center gap-1.5 rounded-md px-1.5 py-1 text-foreground transition-colors hover:bg-muted"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label="날짜 선택"
      >
        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-colors" />
        <span className="text-xs font-medium">{formatDisplayDate(value)}</span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label="날짜 선택 달력"
          className="animate-in fade-in-0 slide-in-from-top-2 zoom-in-95 absolute left-0 top-full z-50 mt-2 w-[280px] rounded-xl border border-border bg-popover p-4 shadow-lg"
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month - 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="이전 달"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold text-foreground">
              {year}년 {month + 1}월
            </span>
            <button
              type="button"
              onClick={() => setViewDate(new Date(year, month + 1, 1))}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="다음 달"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {dayNames.map((day, index) => (
              <div
                key={day}
                className={[
                  'py-1 text-center text-[10px] font-medium',
                  index === 0 ? 'text-red-400' : index === 6 ? 'text-blue-400' : 'text-muted-foreground',
                ].join(' ')}
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map(({ date, outside }, index) => {
              const dateKey = toYMD(date);
              const selected = dateKey === value;
              const currentDay = dateKey === today;
              const hasDiary = entryDates.has(dateKey);
              const sunday = date.getDay() === 0;
              const saturday = date.getDay() === 6;

              return (
                <button
                  key={`${dateKey}-${index}`}
                  type="button"
                  onClick={() => selectDate(date)}
                  className={[
                    'relative flex h-8 w-full flex-col items-center justify-center rounded-md text-xs transition-colors',
                    outside ? 'opacity-30' : '',
                    selected
                      ? 'bg-primary font-semibold text-primary-foreground'
                      : currentDay
                        ? 'bg-primary/10 font-semibold text-primary hover:bg-primary/20'
                        : 'hover:bg-muted',
                    !selected && sunday && !outside ? 'text-red-400' : '',
                    !selected && saturday && !outside ? 'text-blue-400' : '',
                  ].join(' ')}
                  aria-label={`${dateKey}${hasDiary ? ' (일기 있음)' : ''}`}
                  aria-pressed={selected}
                >
                  {date.getDate()}
                  {hasDiary && !selected ? (
                    <span className="absolute bottom-0.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary/60" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-center border-t border-border/60 pt-3">
            <button
              type="button"
              onClick={() => {
                onChange(today);
                setOpen(false);
              }}
              className="text-xs text-primary transition-colors hover:underline"
            >
              오늘로 이동
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default DatePicker;
