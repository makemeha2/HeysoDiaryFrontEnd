import { useQuery } from '@tanstack/react-query';

import { fetchAiQuotaToday } from '../api/aiQuotaApi';

export const AI_QUOTA_QUERY_KEY = ['aiQuota', 'today'] as const;

export const useAiQuota = () => {
  const query = useQuery({
    queryKey: AI_QUOTA_QUERY_KEY,
    queryFn: fetchAiQuotaToday,
    staleTime: 60_000,
  });

  const usedCount = query.data?.usedCount ?? 0;
  const dailyLimit = query.data?.dailyLimit ?? 0;
  const remainingCount = query.data?.remainingCount ?? 0;

  return {
    ...query,
    usedCount,
    dailyLimit,
    remainingCount,
    isQuotaExhausted: query.isLoading || query.isError ? false : remainingCount <= 0,
    isLoading: query.isLoading,
  };
};

export default useAiQuota;
