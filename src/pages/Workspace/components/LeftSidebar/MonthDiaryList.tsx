import type { DiaryEntry } from '../../types/api.types';

type Props = {
  diaries: DiaryEntry[];
  selectedDiaryId: number | null;
  onSelectDiary: (diary: DiaryEntry) => void;
};

export default function MonthDiaryList({ diaries, selectedDiaryId, onSelectDiary }: Props) {
  if (!diaries.length) {
    return <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">이번 달 일기가 아직 없습니다.</p>;
  }

  return (
    <div className="space-y-1">
      {diaries.slice(0, 8).map((diary) => {
        const id = diary.diaryId ?? diary.id ?? null;
        return (
          <button
            key={id ?? diary.title}
            type="button"
            onClick={() => onSelectDiary(diary)}
            className={[
              'w-full rounded-lg px-3 py-2 text-left text-sm transition hover:bg-muted',
              selectedDiaryId === id ? 'bg-secondary font-semibold' : '',
            ].join(' ')}
          >
            <span className="block truncate">{diary.title || 'Untitled'}</span>
            <span className="text-xs text-muted-foreground">{String(diary.diaryDate ?? '').slice(0, 10)}</span>
          </button>
        );
      })}
    </div>
  );
}
