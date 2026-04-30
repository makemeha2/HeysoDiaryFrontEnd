import dayjs from 'dayjs';

import { getMood } from '../../lib/moodCatalog.js';

const MonthDiaryList = ({ diaries, selectedDate, onSelectDate, moodStorage }) => (
  <div className="space-y-2">
    {(diaries ?? []).slice(0, 14).map((diary) => {
      const date = diary.diaryDate ?? diary.createdAt?.slice(0, 10);
      const mood = getMood(moodStorage.getMood(diary.diaryId));
      return (
        <button
          key={diary.diaryId}
          type="button"
          className={`w-full rounded-xl border px-3 py-2 text-left transition ${
            date === selectedDate ? 'border-amber bg-amber/10' : 'border-sand/60 bg-white/65 hover:bg-white'
          }`}
          onClick={() => date && onSelectDate(date)}
        >
          <div className="flex items-center gap-2">
            <span>{mood.emoji}</span>
            <span className="truncate text-sm font-semibold text-clay">{diary.title || 'Untitled'}</span>
          </div>
          <p className="mt-1 text-xs text-clay/55">{date ? dayjs(date).format('M월 D일') : ''}</p>
        </button>
      );
    })}
  </div>
);

export default MonthDiaryList;

