import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DatePickerInline = ({ value, onChange }) => {
  const moveDay = (amount) => onChange(dayjs(value).add(amount, 'day').format('YYYY-MM-DD'));

  return (
    <div className="flex items-center gap-2">
      <button type="button" className="rounded-full border border-sand p-2 hover:bg-white" onClick={() => moveDay(-1)} aria-label="이전 날짜">
        <ChevronLeft className="h-4 w-4" />
      </button>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-full border border-sand bg-white/80 px-4 py-2 text-sm font-semibold text-clay"
      />
      <button type="button" className="rounded-full border border-sand p-2 hover:bg-white" onClick={() => moveDay(1)} aria-label="다음 날짜">
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};

export default DatePickerInline;

