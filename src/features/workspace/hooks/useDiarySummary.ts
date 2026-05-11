import { useMemo } from 'react';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { authFetch } from '@lib/apiClient';
import { useAuthStore, type AuthStore } from '@stores/authStore';

export const DIARY_SUMMARY_QUERY_KEY = ['diarySummary'] as const;
export const DIARY_SUMMARY_STALE_TIME_MS = 10 * 60 * 1000;

export type DiarySummaryTagCount = {
  tag: string;
  count: number;
};

export type DiarySummaryYearlyTagRanking = {
  year: string;
  tags: DiarySummaryTagCount[];
};

export type DiarySummary = {
  generatedAt: string;
  source: 'cache' | 'rebuilt';
  stats: {
    totalDiaryCount: number;
    currentStreakDays: number;
  };
  tagRankings: {
    allTime: DiarySummaryTagCount[];
    yearly: DiarySummaryYearlyTagRanking[];
  };
};

type UseDiarySummaryOptions = {
  enabled?: boolean;
};

const EMPTY_SUMMARY: DiarySummary = {
  generatedAt: '',
  source: 'cache',
  stats: {
    totalDiaryCount: 0,
    currentStreakDays: 0,
  },
  tagRankings: {
    allTime: [],
    yearly: [],
  },
};

const toTagCounts = (value: unknown): DiarySummaryTagCount[] => {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const tag = (item as { tag?: unknown }).tag;
      const count = (item as { count?: unknown }).count;
      if (typeof tag !== 'string') return null;
      return {
        tag,
        count: typeof count === 'number' ? count : Number(count) || 0,
      };
    })
    .filter((item): item is DiarySummaryTagCount => Boolean(item));
};

const toDiarySummary = (value: unknown): DiarySummary => {
  if (!value || typeof value !== 'object') return EMPTY_SUMMARY;

  const data = value as Partial<DiarySummary>;
  const stats = data.stats ?? EMPTY_SUMMARY.stats;
  const tagRankings = data.tagRankings ?? EMPTY_SUMMARY.tagRankings;
  const source = data.source === 'rebuilt' ? 'rebuilt' : 'cache';

  return {
    generatedAt: typeof data.generatedAt === 'string' ? data.generatedAt : '',
    source,
    stats: {
      totalDiaryCount:
        typeof stats.totalDiaryCount === 'number'
          ? stats.totalDiaryCount
          : Number(stats.totalDiaryCount) || 0,
      currentStreakDays:
        typeof stats.currentStreakDays === 'number'
          ? stats.currentStreakDays
          : Number(stats.currentStreakDays) || 0,
    },
    tagRankings: {
      allTime: toTagCounts(tagRankings.allTime),
      yearly: Array.isArray(tagRankings.yearly)
        ? tagRankings.yearly.map((item) => ({
            year: String((item as DiarySummaryYearlyTagRanking)?.year ?? ''),
            tags: toTagCounts((item as DiarySummaryYearlyTagRanking)?.tags),
          }))
        : [],
    },
  };
};

export function useDiarySummary(options: UseDiarySummaryOptions = {}): UseQueryResult<DiarySummary> {
  const { enabled = true } = options;
  const auth = useAuthStore((s: AuthStore) => s.auth);
  const authChecked = useAuthStore((s: AuthStore) => s.authChecked);
  const isSignedIn = authChecked && !!auth;

  const query = useQuery<DiarySummary>({
    queryKey: DIARY_SUMMARY_QUERY_KEY,
    enabled: enabled && isSignedIn,
    staleTime: DIARY_SUMMARY_STALE_TIME_MS,
    queryFn: async ({ signal }) => {
      const res = await authFetch<DiarySummary>('/api/diary/summary', { method: 'GET', signal });
      if (!res.ok) throw new Error('Failed to load diary summary');
      return toDiarySummary(res.data);
    },
  });

  return useMemo(() => query, [query]);
}
