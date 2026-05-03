import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authFetch } from '../../../lib/apiClient';
import { useAuthStore } from '../../../stores/authStore.js';
import type { DiaryEntry } from '../types/api.types';

export const DEFAULT_PAGE = 1;
export const DEFAULT_SIZE = 20;

export type MonthlyDiaryCount = {
  diaryDate?: string;
  date?: string;
  count?: number;
};

export type SaveDiaryPayload = {
  diaryId?: number | null;
  title?: string;
  contentMd?: string;
  diaryDate?: string;
  tags?: string[];
};

export type SaveDiaryResult = {
  diaryId?: number | null;
} & Record<string, unknown>;

export type DeleteDiaryPayload = { diaryId?: number | null } | number | null | undefined;

export type SaveDiarySuccessContext = {
  refreshAfterSave: (savedDiaryId?: number | null) => Promise<void>;
};

export type UseDiaryOptions = {
  page?: number;
  size?: number;
  selectedDateKey?: string;
  monthKey?: string;
  diaryId?: number | null;
  onSaveSuccess?: (
    data: SaveDiaryResult,
    variables: SaveDiaryPayload,
    context: SaveDiarySuccessContext,
  ) => void | Promise<void>;
  onSaveError?: (err: Error) => void;
};

type ApiResponseData = {
  diaries?: unknown;
  tags?: unknown;
  diaryId?: unknown;
};

type DiaryListResponse = {
  diaries?: unknown;
};

type DiaryTagsResponse = {
  tags?: unknown;
};

type AuthState = {
  auth: unknown;
  authChecked: boolean;
};

const toDiaryEntries = (value: unknown): DiaryEntry[] => (Array.isArray(value) ? (value as DiaryEntry[]) : []);

const toStringArray = (value: unknown): string[] => (Array.isArray(value) ? value.map(String) : []);

const toMonthlyDiaryCounts = (value: unknown): MonthlyDiaryCount[] =>
  Array.isArray(value) ? (value as MonthlyDiaryCount[]) : [];

const getDiaryIdFromPayload = (payload: DeleteDiaryPayload): number | null => {
  if (typeof payload === 'number') return payload;
  return payload?.diaryId ?? null;
};

const getCreatedDiaryId = (data: unknown): number | null => {
  if (typeof data === 'number') return data;
  if (data && typeof data === 'object') {
    const diaryId = (data as ApiResponseData).diaryId;
    return typeof diaryId === 'number' ? diaryId : null;
  }
  return null;
};

/**
 * Diary 도메인 전용 훅
 *
 * 목표
 * - "Hook Factory(훅을 반환하는 훅)" 패턴을 피한다.
 * - 화면에서 필요한 데이터/액션을 한 번에 꺼내 쓸 수 있게 한다.
 *
 * 사용 예)
 * const {
 *   isSignedIn,
 *   diaries,
 *   diariesQuery,
 *   dailyDiaries,
 *   dailyDiariesQuery,
 *   monthlyDiaryCounts,
 *   monthlyDiaryCountsQuery,
 *   removeDiaryFromCache,
 * } = useDiary({ page, size, selectedDateKey, monthKey })
 */
const useDiary = ({
  page = DEFAULT_PAGE,
  size = DEFAULT_SIZE,
  selectedDateKey = '',
  monthKey = '',
  diaryId = null,
  onSaveSuccess,
  onSaveError,
}: UseDiaryOptions = {}) => {
  const queryClient = useQueryClient();

  const auth = useAuthStore((s: AuthState) => s.auth);
  const authChecked = useAuthStore((s: AuthState) => s.authChecked);
  const isSignedIn = authChecked && !!auth;

  const diariesQuery = useQuery<DiaryEntry[]>({
    queryKey: ['diaryEntries', page, size],
    enabled: isSignedIn,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
      const res = await authFetch<DiaryListResponse>(`/api/diary?${query}`, { method: 'GET', signal });
      return toDiaryEntries(res.data.diaries);
    },
  });

  const dailyDiariesQuery = useQuery<DiaryEntry[]>({
    queryKey: ['diaryDaily', selectedDateKey],
    enabled: isSignedIn && !!selectedDateKey,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch<DiaryListResponse>(`/api/diary/daily?day=${selectedDateKey}`, { signal });
      return toDiaryEntries(res.data.diaries);
    },
  });

  const myTagsQuery = useQuery<string[]>({
    queryKey: ['diaryMyTags'],
    enabled: isSignedIn,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch<DiaryTagsResponse | string[]>('/api/diary/mytags', { method: 'GET', signal });
      const tags = Array.isArray(res.data) ? res.data : res.data.tags;
      return toStringArray(tags);
    },
  });

  // 캘린더용: 월별 날짜별 작성 개수
  const monthlyDiaryCountsQuery = useQuery<MonthlyDiaryCount[]>({
    queryKey: ['monthlyDiaryCounts', monthKey],
    enabled: isSignedIn && !!monthKey,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch<MonthlyDiaryCount[]>(`/api/diary/monthly?month=${monthKey}`, { signal });
      return toMonthlyDiaryCounts(res.data);
    },
  });

  // 다이어리 상세
  const diaryDetailQuery = useQuery<DiaryEntry>({
    queryKey: ['diaryDetail', diaryId],
    enabled: isSignedIn && !!diaryId,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch<DiaryEntry>(`/api/diary/${diaryId}`, { method: 'GET', signal });
      if (!res.ok) throw new Error('Failed to load diary detail');
      return res.data;
    },
  });

  // 저장 이후 화면에서 필요한 캐시 갱신을 한 곳에 모읍니다.
  const refreshAfterSave = async (savedDiaryId?: number | null) => {
    const targetDiaryId = savedDiaryId ?? diaryId;
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['diaryEntries', page, size] }),
      // 날짜별 목록은 어떤 날짜가 변경됐는지 추적이 번거로우니 prefix로 무효화
      queryClient.invalidateQueries({ queryKey: ['diaryDaily'] }),
      // 월별 카운트: 현재 월만 알고 있으면 해당 월만, 아니면 prefix로 전체 무효화
      monthKey
        ? queryClient.refetchQueries({ queryKey: ['monthlyDiaryCounts', monthKey] })
        : queryClient.invalidateQueries({ queryKey: ['monthlyDiaryCounts'] }),
      targetDiaryId
        ? queryClient.invalidateQueries({ queryKey: ['diaryDetail', targetDiaryId] })
        : Promise.resolve(),
    ]);
  };

  const refreshAfterDelete = async (deletedDiaryId?: number | null) => {
    if (!deletedDiaryId) return;
    // removeDiaryFromCache(deletedDiaryId);
    await Promise.all([
      queryClient.refetchQueries({ queryKey: ['diaryEntries', page, size] }),
      queryClient.invalidateQueries({ queryKey: ['diaryDaily'] }),
      monthKey
        ? queryClient.refetchQueries({ queryKey: ['monthlyDiaryCounts', monthKey] })
        : queryClient.invalidateQueries({ queryKey: ['monthlyDiaryCounts'] }),
      queryClient.removeQueries({ queryKey: ['diaryDetail', deletedDiaryId] }),
    ]);
  };

  // 저장(생성/수정)
  const saveDiaryMutation = useMutation<SaveDiaryResult, Error, SaveDiaryPayload>({
    mutationFn: async (payload) => {
      const isUpdate = !!(payload?.diaryId ?? diaryId);
      const targetId = payload?.diaryId ?? diaryId;

      if (isUpdate && targetId) {
        const res = await authFetch<Record<string, unknown>>(`/api/diary/${targetId}/edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update diary');
        const data = res.data && typeof res.data === 'object' ? (res.data as Record<string, unknown>) : {};
        return { diaryId: targetId, ...data };
      }

      const res = await authFetch<number | { diaryId?: unknown }>('/api/diary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to create diary');
      const data = await res.json();
      const createdId = getCreatedDiaryId(data);
      return { diaryId: createdId };
    },
    onSuccess: async (data, variables) => {
      // UI는 컴포넌트에서(알림/모달 전환 등) 처리할 수 있게 위임
      if (onSaveSuccess) {
        await onSaveSuccess(data, variables, { refreshAfterSave });
        return;
      }
      await refreshAfterSave(data?.diaryId);
    },
    onError: (err) => {
      onSaveError?.(err);
    },
  });

  // 화면에서 자주 쓰는 파생 데이터
  const diaries = useMemo(() => diariesQuery.data ?? [], [diariesQuery.data]);
  const dailyDiaries = dailyDiariesQuery.data ?? [];
  const myTags = myTagsQuery.data ?? [];
  const monthlyDiaryCounts = monthlyDiaryCountsQuery.data ?? [];
  const diaryDetail = diaryDetailQuery.data ?? null;

  const recentDiaries = useMemo(() => {
    // 최신순 정렬: diaryId(숫자) 기반 정렬이 가장 안정적
    return [...diaries].sort((a, b) => (b?.diaryId ?? 0) - (a?.diaryId ?? 0));
  }, [diaries]);

  // const removeDiaryFromCache = (diaryId) => {
  //   if (!diaryId) return;
  //   queryClient.setQueryData(['diaryEntries', page, size], (prev = []) =>
  //     prev.filter((d) => (d?.diaryId ?? d?.id) !== diaryId),
  //   );
  // };

  // 삭제
  const deleteDiaryMutation = useMutation<{ diaryId: number }, Error, DeleteDiaryPayload>({
    mutationFn: async (payload) => {
      const targetId = getDiaryIdFromPayload(payload) ?? diaryId;
      if (!targetId) throw new Error('Missing diaryId for delete');

      const res = await authFetch(`/api/diary/${targetId}/delete`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to delete diary');
      return { diaryId: targetId };
    },
    onSuccess: async (data) => {
      await refreshAfterDelete(data?.diaryId);
    },
  });

  return {
    // auth
    authChecked,
    isSignedIn,

    // queries
    diariesQuery,
    dailyDiariesQuery,
    myTagsQuery,
    monthlyDiaryCountsQuery,
    diaryDetailQuery,
    saveDiaryMutation,
    refreshAfterSave,

    // data
    diaries,
    dailyDiaries,
    myTags,
    monthlyDiaryCounts,
    diaryDetail,
    recentDiaries,

    // actions
    // removeDiaryFromCache,
    deleteDiaryMutation,
  };
};

export default useDiary;
export { useDiary };
