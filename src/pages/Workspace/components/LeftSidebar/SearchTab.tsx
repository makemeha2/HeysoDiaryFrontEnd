import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { mockMoodByDate } from '@workspace/lib/mockData';
import type { MoodId } from '@workspace/lib/moodCatalog';
import type { DiaryEntry } from '@workspace/types/api.types';

type Props = {
  diaries: DiaryEntry[];
  onSelectDiary: (diary: DiaryEntry) => void;
};

type SearchType = 'tag' | 'title' | 'content';

const itemsPerPage = 30;

const moodEmoji: Record<MoodId, string> = {
  calm: '☁️',
  happy: '😊',
  tired: '😴',
  sad: '😢',
  anxious: '😟',
  proud: '🌟',
};

function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) return tags.map(String).filter(Boolean);
  if (typeof tags === 'string') return tags.split(',').map((tag) => tag.trim()).filter(Boolean);
  return [];
}

function normalizeDate(diary: DiaryEntry) {
  const parsed = dayjs(diary.diaryDate ?? diary.createdAt);
  return parsed.isValid() ? parsed.format('YYYY-MM-DD') : '';
}

const SearchTab = ({ diaries, onSelectDiary }: Props) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('title');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasSearched, setHasSearched] = useState(false);

  const results = useMemo(() => {
    if (!hasSearched) return [];
    const normalizedQuery = query.trim().toLowerCase();

    return diaries.filter((diary) => {
      const diaryDate = normalizeDate(diary);
      if (startDate && diaryDate < startDate) return false;
      if (endDate && diaryDate > endDate) return false;
      if (!normalizedQuery) return true;

      if (searchType === 'tag') {
        return normalizeTags(diary.tags).some((tag) => tag.toLowerCase().includes(normalizedQuery));
      }
      if (searchType === 'content') {
        return (diary.contentMd ?? '').toLowerCase().includes(normalizedQuery);
      }
      return (diary.title ?? '').toLowerCase().includes(normalizedQuery);
    });
  }, [diaries, endDate, hasSearched, query, searchType, startDate]);

  const totalPages = Math.ceil(results.length / itemsPerPage);
  const paginatedResults = results.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleSearch = () => {
    setHasSearched(true);
    setPage(1);
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="mb-0.5 block text-[10px] text-muted-foreground">시작일</label>
            <input
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="w-full rounded border border-border/60 bg-muted px-2 py-1.5 text-xs outline-none focus:border-primary/50"
            />
          </div>
          <div className="flex-1">
            <label className="mb-0.5 block text-[10px] text-muted-foreground">종료일</label>
            <input
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="w-full rounded border border-border/60 bg-muted px-2 py-1.5 text-xs outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <div>
          <label className="mb-0.5 block text-[10px] text-muted-foreground">구분</label>
          <select
            value={searchType}
            onChange={(event) => setSearchType(event.target.value as SearchType)}
            className="w-full rounded border border-border/60 bg-muted px-2 py-1.5 text-xs outline-none focus:border-primary/50"
          >
            <option value="title">제목</option>
            <option value="content">내용</option>
            <option value="tag">태그</option>
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex flex-1 items-center gap-2 rounded border border-border/60 bg-muted px-2 py-1.5">
            <Search className="h-3 w-3 shrink-0 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') handleSearch();
              }}
              placeholder="검색어 입력"
              className="min-w-0 flex-1 bg-transparent text-xs text-foreground outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="button"
            onClick={handleSearch}
            className="rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground transition-opacity hover:opacity-90"
          >
            검색
          </button>
        </div>
      </div>

      <div className="h-px bg-border/60" />

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!hasSearched ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            검색 조건을 입력하고
            <br />
            검색 버튼을 눌러주세요.
          </p>
        ) : null}

        {hasSearched && results.length === 0 ? <p className="py-6 text-center text-xs text-muted-foreground">검색 결과가 없습니다.</p> : null}

        {hasSearched && results.length > 0 ? (
          <div className="space-y-1">
            <p className="mb-2 text-[10px] text-muted-foreground">{results.length}개 결과</p>
            {paginatedResults.map((diary) => {
              const diaryDate = normalizeDate(diary);
              const mood = moodEmoji[((diary as DiaryEntry & { mood?: MoodId }).mood ?? mockMoodByDate[diaryDate] ?? 'calm') as MoodId];

              return (
                <button
                  key={diary.diaryId ?? diary.id ?? `${diaryDate}-${diary.title ?? 'untitled'}`}
                  type="button"
                  onClick={() => onSelectDiary(diary)}
                  className="group flex w-full items-center gap-2 rounded px-2 py-1.5 text-left transition-colors hover:bg-muted"
                >
                  <span className="shrink-0 text-sm">{mood}</span>
                  <span className="w-16 shrink-0 text-[11px] text-muted-foreground">{diaryDate.slice(5).replace('-', '/')}</span>
                  <span className="truncate text-xs text-foreground transition-colors group-hover:text-primary">
                    {diary.title || '(제목 없음)'}
                  </span>
                </button>
              );
            })}
          </div>
        ) : null}
      </div>

      {hasSearched && totalPages > 1 ? (
        <div className="flex shrink-0 items-center justify-center gap-2 border-t border-border/40 pt-2">
          <button
            type="button"
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            disabled={page === 1}
            className={[
              'flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors',
              page === 1 ? 'cursor-not-allowed text-muted-foreground/50' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            <ChevronLeft className="h-3 w-3" />
            이전
          </button>
          <span className="text-[10px] text-muted-foreground">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
            disabled={page === totalPages}
            className={[
              'flex items-center gap-1 rounded px-2 py-1 text-xs transition-colors',
              page === totalPages
                ? 'cursor-not-allowed text-muted-foreground/50'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            ].join(' ')}
          >
            다음
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default SearchTab;
