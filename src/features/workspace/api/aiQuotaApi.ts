import { authFetch } from '@lib/apiClient';

export interface AiQuotaStatus {
  usedCount: number;
  dailyLimit: number;
  remainingCount: number;
}

export async function fetchAiQuotaToday(): Promise<AiQuotaStatus> {
  const res = await authFetch<AiQuotaStatus>('/api/ai-quota/today', { method: 'GET' });

  if (!res.ok) {
    throw new Error('AI 사용량 정보를 불러오지 못했어요.');
  }

  return res.data;
}
