import { useMemo } from 'react';
import type { DiaryEntry } from '../types/api.types';

export function useSearchDiaries(diaries: DiaryEntry[], query: string) {
  return useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return [];
    return diaries.filter((diary) => {
      const title = diary.title ?? '';
      const content = diary.contentMd ?? '';
      return `${title} ${content}`.toLowerCase().includes(keyword);
    });
  }, [diaries, query]);
}
