import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { DayPicker } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { authFetch } from '../../../lib/apiClient';

// YYYY-MM-DD (local) 키를 반환합니다.
const formatDateKey = (date) => {
  const d = dayjs(date);
  if (!d.isValid()) return '';
  return d.format('YYYY-MM-DD');
};

const isSameDay = (a, b) => {
  if (!a || !b) return false;
  return dayjs(a).isSame(dayjs(b), 'day');
};

/**
 * 다이어리 일수를 캘린더로 표시합니다.
 * - 월 이동/선택 시 월별 일기 개수를 API로 불러옵니다.
 * - 하루 여러 건이 있는 경우 농도가 다른 초록색으로 표시합니다.
 * - 같은 셀을 다시 클릭하면 선택 해제합니다.
 * - 더블 클릭시 단일 항목만 있는 날이면 상세 보기 콜백을 호출합니다.
 */
const DiaryCalender = ({ entries = [], selectedDate, onSelectDate, onSingleEntryDoubleClick }) => {
  const [currentMonth, setCurrentMonth] = useState(() => dayjs(new Date()).toDate());
  const monthParam = dayjs(currentMonth).format('YYYY-MM');

  const { data: monthlyCnts = [] } = useQuery({
    queryKey: ['monthlyDiary', monthParam],
    queryFn: async () => {
      const res = await authFetch('/api/diary/monthly?month=' + monthParam);
      return Array.isArray(res.data) ? res.data : [];
    },
    onError: (err) => {
      console.error('Failed to load monthly diary counts', err);
    },
  });

  const countsByDay = useMemo(() => {
    return monthlyCnts.reduce((acc, item) => {
      const key = formatDateKey(item?.diaryDate);
      if (!key) return acc;
      acc[key] = item.diaryCount ?? 0;
      return acc;
    }, {});
  }, [monthlyCnts]);

  const greenSteps = ['#e8f6ed', '#c9ead7', '#9fdac0', '#6dc6a1', '#40a777'];

  const getCount = (day) => countsByDay[formatDateKey(day)] || 0;
  const getTier = (count) => {
    if (count <= 0) return null;
    if (count >= 5) return 4;
    return count - 1; // 1..4 -> 0..3
  };

  const handleDayClick = (day, _, evt) => {
    if (!day) return;
    const dayKey = formatDateKey(day);
    const isSelected = isSameDay(day, selectedDate);
    const dayEntries = entries.filter((entry) => formatDateKey(entry.date) === dayKey);
    if (isSelected) {
      onSelectDate?.(null);
      return;
    }
    setCurrentMonth(day);
    onSelectDate?.(day);
    const isDoubleClick = evt?.detail === 2;
    if (isDoubleClick && dayEntries.length === 1 && onSingleEntryDoubleClick) {
      onSingleEntryDoubleClick(dayEntries[0]);
    }
  };

  return (
    <div className="rounded-2xl border border-sand/50 bg-white/70 p-4 shadow-soft">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onDayClick={handleDayClick}
        onMonthChange={(month) => setCurrentMonth(dayjs(month || new Date()).toDate())}
        month={currentMonth}
        showOutsideDays
        styles={{
          caption: { color: '#5c4033', fontWeight: 600 },
          nav_button: { color: '#5c4033' },
        }}
        // modifiers={{
        //   tier1: (day) => getTier(getCount(day)) === 0,
        //   tier2: (day) => getTier(getCount(day)) === 1,
        //   tier3: (day) => getTier(getCount(day)) === 2,
        //   tier4: (day) => getTier(getCount(day)) === 3,
        //   tier5: (day) => getTier(getCount(day)) === 4,
        // }}
        modifiers={{
          tier1: (day) => getTier(getCount(day)) === 0,
          tier2: (day) => getTier(getCount(day)) === 1,
          tier3: (day) => getTier(getCount(day)) === 2,
          tier4: (day) => getTier(getCount(day)) === 3,
          tier5: (day) => getTier(getCount(day)) === 4,
        }}
        modifiersStyles={{
          selected: { backgroundColor: '#f6b100', color: '#fff' },
          tier1: { backgroundColor: greenSteps[0], color: '#0f3b25' },
          tier2: { backgroundColor: greenSteps[1], color: '#0f3b25' },
          tier3: { backgroundColor: greenSteps[2], color: '#0f3b25' },
          tier4: { backgroundColor: greenSteps[3], color: '#0f3b25' },
          tier5: { backgroundColor: greenSteps[4], color: '#fff' },
        }}
      />
      {/* <div className="mt-2 flex items-center gap-3 text-xs text-clay/60">
        <span className="inline-flex h-3 w-3 items-center justify-center rounded-full bg-amber"></span>
        <span>Selected day</span>
        {greenSteps.map((color, idx) => (
          <span key={color} className="flex items-center gap-1">
            <span
              className="inline-flex h-3 w-3 rounded-full"
              style={{ backgroundColor: color }}
            ></span>
            <span>{idx + 1}+</span>
          </span>
        ))}
      </div> */}
    </div>
  );
};

export default DiaryCalender;
