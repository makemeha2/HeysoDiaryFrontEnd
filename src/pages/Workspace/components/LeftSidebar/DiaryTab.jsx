import dayjs from 'dayjs';

import MiniCalendar from './MiniCalendar.jsx';
import MonthDiaryList from './MonthDiaryList.jsx';
import WeatherWidget from './WeatherWidget.jsx';

const DiaryTab = ({ state, diary, moodStorage }) => {
  const monthKey = dayjs(state.selectedDate).format('YYYY-MM');
  const monthlyDiaries = (diary.diaries ?? []).filter((item) => {
    const date = item.diaryDate ?? item.createdAt?.slice(0, 10);
    return date?.startsWith(monthKey);
  });

  return (
    <div className="space-y-5">
      <MiniCalendar
        selectedDate={state.selectedDate}
        monthKey={monthKey}
        counts={diary.monthlyDiaryCounts}
        onSelectDate={state.setSelectedDate}
      />
      <WeatherWidget />
      <section>
        <h2 className="mb-3 text-sm font-bold text-clay">이번 달 기록</h2>
        <MonthDiaryList
          diaries={monthlyDiaries}
          selectedDate={state.selectedDate}
          onSelectDate={state.setSelectedDate}
          moodStorage={moodStorage}
        />
      </section>
    </div>
  );
};

export default DiaryTab;

