import { useMemo, useState } from 'react';
import reduce from 'lodash/reduce';
import dayjs from 'dayjs';
import { DayPicker } from 'react-day-picker';
import { useQuery } from '@tanstack/react-query';
import { authFetch } from '../../../lib/apiClient';
import { useAuthStore } from '../../../stores/authStore.js';

// YYYY-MM-DD (local) 키를 반환합니다.
const toDateKey = (date) => {
  const d = dayjs(date);
  return d.isValid() ? d.format('YYYY-MM-DD') : '';
};

const isSameCalendarDay = (a, b) => {
  if (!a || !b) return false;
  return dayjs(a).isSame(dayjs(b), 'day');
};

/**
 * 다이어리 캘린더
 * - 월 이동/선택 시 월별 일기 개수를 API로 불러옵니다.
 * - 하루 여러 건이 있는 경우 농도가 다른 초록색으로 표시합니다.
 * - 같은 셀을 다시 클릭하면 선택 해제합니다.
 * - 더블 클릭 시 해당 날짜에 1건만 있으면 상세 보기 콜백을 호출합니다.
 */
const DiaryCalender = ({ selectedDate, onSelectDate, onSingleDiaryDoubleClick }) => {
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs().toDate());
  const monthKey = dayjs(visibleMonth).format('YYYY-MM');

  const auth = useAuthStore((s) => s.auth);
  const authChecked = useAuthStore((s) => s.authChecked);
  const isSignedIn = authChecked && !!auth;

  const { data: monthlyDiaryCounts = [] } = useQuery({
    queryKey: ['monthlyDiaryCounts', monthKey],
    queryFn: async () => {
      const res = await authFetch(`/api/diary/monthly?month=${monthKey}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: isSignedIn,
  });

  // { '2025-12-16': 3, '2025-12-15': 1, ... }
  const dailyCountByDateKey = useMemo(() => {
    return reduce(
      monthlyDiaryCounts,
      (acc, item) => {
        const dateKey = toDateKey(item?.diaryDate);
        if (!dateKey) return acc;
        acc[dateKey] = item?.diaryCount ?? 0;
        return acc;
      },
      {},
    );
  }, [monthlyDiaryCounts]);

  const greenTierColors = ['#e8f6ed', '#c9ead7', '#9fdac0', '#6dc6a1', '#40a777'];

  const getDiaryCountForDate = (date) => dailyCountByDateKey[toDateKey(date)] || 0;

  const getGreenTier = (count) => {
    if (count <= 0) return null;
    if (count >= 5) return 4;
    return count - 1; // 1..4 -> 0..3
  };

  const handleDateClick = (date, _, evt) => {
    if (!date) return;

    const dateKey = toDateKey(date);
    const isSelected = isSameCalendarDay(date, selectedDate);

    if (isSelected) {
      onSelectDate?.(null);
      return;
    }

    setVisibleMonth(date);
    onSelectDate?.(date);

    const isDoubleClick = evt?.detail === 2;
    if (!isDoubleClick || !onSingleDiaryDoubleClick) return;

    const count = dailyCountByDateKey[dateKey] ?? 0;
    if (count === 1) {
      // “1건이면 상세 보기로” 라는 의미만 전달 (상세 조회는 상위에서 수행)
      onSingleDiaryDoubleClick(date);
    }
  };

  return (
    <div className="rounded-2xl border border-sand/50 bg-white/70 p-4 shadow-soft">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onDayClick={handleDateClick}
        onMonthChange={(month) => setVisibleMonth(dayjs(month || new Date()).toDate())}
        month={visibleMonth}
        showOutsideDays
        styles={{
          root: {
            '--rdp-accent-color': '#d9b26a',
            '--rdp-accent-color-dark': '#d9b26a',
            '--rdp-background-color': '#f8e8c6',
          },
          caption: { color: '#5c4033', fontWeight: 600 },
          nav_button: { color: '#5c4033' },
          day: { borderRadius: '10px' },
          day_button: {
            outline: 'none',
            boxShadow: 'none',
            borderRadius: '10px',
            color: '#5c4033',
            transition: 'box-shadow 120ms, background-color 120ms',
          },
        }}
        modifiers={{
          tier1: (day) => getGreenTier(getDiaryCountForDate(day)) === 0,
          tier2: (day) => getGreenTier(getDiaryCountForDate(day)) === 1,
          tier3: (day) => getGreenTier(getDiaryCountForDate(day)) === 2,
          tier4: (day) => getGreenTier(getDiaryCountForDate(day)) === 3,
          tier5: (day) => getGreenTier(getDiaryCountForDate(day)) === 4,
        }}
        modifiersStyles={{
          selected: {
            backgroundColor: '#f8e8c6',
            color: '#5c4033',
            boxShadow: '0 0 0 2px #f6c87a80 inset',
          },
          tier1: { backgroundColor: greenTierColors[0], color: '#0f3b25' },
          tier2: { backgroundColor: greenTierColors[1], color: '#0f3b25' },
          tier3: { backgroundColor: greenTierColors[2], color: '#0f3b25' },
          tier4: { backgroundColor: greenTierColors[3], color: '#0f3b25' },
          tier5: { backgroundColor: greenTierColors[4], color: '#fff' },
        }}
      />
    </div>
  );
};

export default DiaryCalender;
