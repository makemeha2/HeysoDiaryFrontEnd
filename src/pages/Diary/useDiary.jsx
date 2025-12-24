import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '../../lib/apiClient.js';
import { useAuthStore } from '../../stores/authStore.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_SIZE = 20;

const fetchDiaries = async ({ signal, page = DEFAULT_PAGE, size = DEFAULT_SIZE }) => {
  const query = new URLSearchParams({ page: String(page), size: String(size) }).toString();
  const res = await authFetch(`/api/diary?${query}`, { method: 'GET', signal });

  const diaries = res.data?.diaries;
  if (!Array.isArray(diaries)) return [];

  return diaries;
};

const useDiary = () => {
  const queryClient = useQueryClient();

  const auth = useAuthStore((s) => s.auth);
  const authChecked = useAuthStore((s) => s.authChecked);
  const isSignedIn = authChecked && !!auth;

  const removeDiaryFromCache = (diaryId, { page = DEFAULT_PAGE, size = DEFAULT_SIZE } = {}) => {
    if (!diaryId) return;

    queryClient.setQueryData(['diaryEntries', page, size], (prev = []) =>
      prev.filter((diary) => (diary.diaryId ?? diary.id) !== diaryId),
    );
  };

  const useDiaryEntries = ({ page = DEFAULT_PAGE, size = DEFAULT_SIZE } = {}) => {
    //const { isSignedIn } = useDiary();

    return useQuery({
      queryKey: ['diaryEntries', page, size],
      queryFn: ({ signal }) => fetchDiaries({ signal, page, size }),
      enabled: isSignedIn,
      staleTime: 0,
    });
  };

  const useDailyDiaries = (selectedDateKey) => {
    //const { isSignedIn } = useDiary();

    return useQuery({
      queryKey: ['diaryDaily', selectedDateKey],
      queryFn: async ({ signal }) => {
        const res = await authFetch(`/api/diary/daily?day=${selectedDateKey}`, { signal });
        const diaries = res.data?.diaries;
        return Array.isArray(diaries) ? diaries : [];
      },
      enabled: isSignedIn && !!selectedDateKey,
      staleTime: 0,
    });
  };

  const useMonthlyDiaryCounts = (monthKey) => {
    //const { isSignedIn } = useDiary();

    return useQuery({
      queryKey: ['monthlyDiaryCounts', monthKey],
      queryFn: async () => {
        const res = await authFetch(`/api/diary/monthly?month=${monthKey}`);
        return Array.isArray(res.data) ? res.data : [];
      },
      enabled: isSignedIn && !!monthKey,
    });
  };

  const useDiaryDetail = ({ diaryId, enabled = true } = {}) => {
    return useQuery({
      queryKey: ['diaryDetail', diaryId],
      enabled: enabled && !!diaryId,
      queryFn: async ({ signal }) => {
        const res = await authFetch(`/api/diary/${diaryId}`, { method: 'GET', signal });
        if (!res.ok) {
          throw new Error('Failed to load diary detail');
        }
        return res.data;
      },
    });
  };

  const useSaveDiary = ({ diaryId, diaryDetail, onSuccess, onError } = {}) => {
    const queryClient = useQueryClient();

    return useMutation({
      mutationFn: async (payload) => {
        const shouldUpdate = diaryId && diaryDetail;

        if (shouldUpdate) {
          const res = await authFetch(`/api/diary/${diaryId}/edit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });

          if (!res.ok) {
            throw new Error('Failed to update diary');
          }

          return res.data;
        }

        return null;
      },
      onSuccess: async (data) => {
        await Promise.all([
          queryClient.refetchQueries({
            queryKey: ['diaryEntries', DEFAULT_PAGE, DEFAULT_SIZE],
          }),
          queryClient.invalidateQueries({ queryKey: ['diaryDaily'] }),
          queryClient.refetchQueries({ queryKey: ['monthlyDiaryCounts'] }),
          queryClient.refetchQueries({ queryKey: ['diaryDetail', diaryId] }),
        ]);

        await onSuccess?.(data);
      },
      onError,
    });
  };

  return {
    useDiaryEntries,
    useDailyDiaries,
    useMonthlyDiaryCounts,
    useDiaryDetail,
    useSaveDiary,
  };
};

export default useDiary;
