import { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useSearchDiaries } from '../../hooks/useSearchDiaries';
import type { DiaryEntry } from '../../types/api.types';

type Props = {
  diaries: DiaryEntry[];
  onSelectDiary: (diary: DiaryEntry) => void;
};

export default function SearchTab({ diaries, onSelectDiary }: Props) {
  const [query, setQuery] = useState('');
  const results = useSearchDiaries(diaries, query);

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="검색" />
      </div>
      <div className="space-y-1">
        {results.map((diary) => (
          <button
            key={diary.diaryId ?? diary.id}
            type="button"
            className="w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-muted"
            onClick={() => onSelectDiary(diary)}
          >
            <span className="block truncate">{diary.title || 'Untitled'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
