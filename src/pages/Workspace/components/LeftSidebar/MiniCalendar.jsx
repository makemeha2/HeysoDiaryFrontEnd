import dayjs from 'dayjs';

const MiniCalendar = ({ selectedDate, monthKey, counts, onSelectDate }) => {
  const start = dayjs(monthKey).startOf('month');
  const daysInMonth = start.daysInMonth();
  const offset = start.day();
  const countMap = new Map((counts ?? []).map((item) => [item.diaryDate ?? item.day, item.count ?? item.diaryCount ?? 1]));
  const cells = Array.from({ length: offset + daysInMonth }, (_, index) => {
    if (index < offset) return null;
    return start.add(index - offset, 'day');
  });

  return (
    <div>
      <div className="mb-3 grid grid-cols-7 text-center text-xs font-semibold text-clay/45">
        {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="aspect-square" />;
          const key = date.format('YYYY-MM-DD');
          const isSelected = key === selectedDate;
          return (
            <button
              key={key}
              type="button"
              className={`relative aspect-square rounded-lg text-sm font-medium ${
                isSelected ? 'bg-amber text-white' : 'bg-white/65 text-clay hover:bg-white'
              }`}
              onClick={() => onSelectDate(key)}
            >
              {date.date()}
              {countMap.has(key) && <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-moss" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;

