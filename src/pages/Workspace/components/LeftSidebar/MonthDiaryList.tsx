import dayjs from 'dayjs';
import { mockMoodByDate } from '../../lib/mockData';
import type { MoodId } from '../../lib/moodCatalog';
import type { DiaryEntry } from '../../types/api.types';

type Props = {
  selectedDate: string;
  selectedMood: MoodId | null;
  diaries: DiaryEntry[];
  selectedDiaryId: number | null;
  onSelectDiary: (diary: DiaryEntry) => void;
};

const moodEmoji: Record<MoodId, { emoji: string; label: string }> = {
  calm: { emoji: '☁️', label: '차분' },
  happy: { emoji: '😊', label: '기쁨' },
  tired: { emoji: '😴', label: '피곤' },
  sad: { emoji: '😢', label: '슬픔' },
  anxious: { emoji: '😟', label: '불안' },
  proud: { emoji: '🌟', label: '뿌듯' },
};

const normalizeDate = (diary: DiaryEntry) => dayjs(diary.diaryDate ?? diary.createdAt ?? '').format('YYYY-MM-DD');

const getDiaryMood = (diary: DiaryEntry, selectedDate: string, selectedMood: MoodId | null): MoodId => {
  const diaryDate = normalizeDate(diary);
  const directMood = (diary as DiaryEntry & { mood?: MoodId }).mood;
  return directMood ?? mockMoodByDate[diaryDate] ?? (diaryDate === selectedDate ? selectedMood : null) ?? 'calm';
};

const formatShortDate = (date: string) => `${Number(date.slice(8, 10))}일`;

const getDayOfWeek = (date: string) => ['일', '월', '화', '수', '목', '금', '토'][dayjs(date).day()];

export default function MonthDiaryList({ selectedDate, selectedMood, diaries, selectedDiaryId, onSelectDiary }: Props) {
  const currentMonth = selectedDate.slice(0, 7);
  const [year, month] = currentMonth.split('-');
  const monthDiaries = diaries
    .filter((diary) => normalizeDate(diary).startsWith(currentMonth))
    .sort((left, right) => normalizeDate(right).localeCompare(normalizeDate(left)));

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-1.5 flex shrink-0 items-center px-1">
        <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          {year}년 {Number(month)}월 일기
        </span>
        <span className="ml-1.5 text-[10px] text-muted-foreground/70">({monthDiaries.length}편)</span>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto pr-0.5">
        {monthDiaries.length === 0 ? (
          <p className="py-4 text-center text-xs text-muted-foreground">이번 달 작성한 일기가 없습니다.</p>
        ) : (
          monthDiaries.map((diary) => {
            const id = diary.diaryId ?? diary.id ?? null;
            const diaryDate = normalizeDate(diary);
            const active = selectedDiaryId === id || diaryDate === selectedDate;
            const mood = moodEmoji[getDiaryMood(diary, selectedDate, selectedMood)];

            return (
              <button
                key={id ?? `${diaryDate}-${diary.title ?? 'untitled'}`}
                type="button"
                onClick={() => onSelectDiary(diary)}
                className={[
                  'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
              >
                <span className="shrink-0 text-base leading-none" role="img" aria-label={mood.label}>
                  {mood.emoji}
                </span>
                <div className="flex min-w-0 flex-1 items-center gap-1.5">
                  <span className={['shrink-0 text-xs', active ? 'text-primary' : 'text-muted-foreground'].join(' ')}>
                    {formatShortDate(diaryDate)}({getDayOfWeek(diaryDate)})
                  </span>
                  <span className={['truncate text-xs', active ? 'font-medium text-primary' : 'text-foreground'].join(' ')}>
                    {diary.title || '(제목 없음)'}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
