import { authFetch } from '@lib/apiClient.js';

const getErrorMessageFromResponse = (data) => {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof data?.error === 'string') return data.error;
  return '';
};

export const requestDiaryAiPolish = async ({ diaryId = null, content }) => {
  const res = await authFetch('/api/diary-ai-polish/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ diaryId, content }),
  });

  if (!res.ok) {
    const serverMessage = getErrorMessageFromResponse(res.data);
    const error = new Error(serverMessage || '글다듬기 요청에 실패했어요.');
    error.status = res.status;
    error.data = res.data;
    throw error;
  }

  return res.data;
};

