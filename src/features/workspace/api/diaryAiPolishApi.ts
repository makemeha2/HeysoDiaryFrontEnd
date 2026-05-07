import { authFetch } from '@lib/apiClient';

export type DiaryAiPolishMode = 'shorten' | 'smooth' | 'warm' | 'clear' | string;

export type DiaryAiPolishRequest = {
  diaryId?: number | null;
  content: string;
  mode: DiaryAiPolishMode;
};

export type DiaryAiPolishResponse = {
  polishedContent?: string;
  remainingCount?: number;
};

export type DiaryAiPolishErrorData = {
  message?: string;
  error?: string;
};

export class DiaryAiPolishError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = 'DiaryAiPolishError';
    this.status = status;
    this.data = data;
  }
}

function getErrorMessageFromResponse(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data !== 'object') return '';

  const maybeErrorData = data as DiaryAiPolishErrorData;
  if (typeof maybeErrorData.message === 'string') return maybeErrorData.message;
  if (typeof maybeErrorData.error === 'string') return maybeErrorData.error;
  return '';
}

export async function requestDiaryAiPolish({
  diaryId = null,
  content,
  mode,
}: DiaryAiPolishRequest): Promise<DiaryAiPolishResponse> {
  const res = await authFetch<DiaryAiPolishResponse | DiaryAiPolishErrorData | string>(
    '/api/diary-ai-polish/request',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ diaryId, content, mode }),
    },
  );

  if (!res.ok) {
    const serverMessage = getErrorMessageFromResponse(res.data);
    throw new DiaryAiPolishError(
      serverMessage || '글다듬기 요청에 실패했어요.',
      res.status,
      res.data,
    );
  }

  return res.data as DiaryAiPolishResponse;
}
