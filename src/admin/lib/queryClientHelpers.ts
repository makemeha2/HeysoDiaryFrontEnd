import type { AdminApiResult } from './api';

export class AdminApiError extends Error {
  status: number;
  errorMessage: string;

  constructor(status: number, errorMessage: string) {
    super(errorMessage);
    this.name = 'AdminApiError';
    this.status = status;
    this.errorMessage = errorMessage;
  }
}

export function assertOk<T>(result: AdminApiResult<T>): T {
  if (!result.ok) {
    throw new AdminApiError(result.status, result.errorMessage ?? '요청 처리 중 오류가 발생했습니다.');
  }
  return result.data;
}

export const adminRetry = (failureCount: number, error: unknown): boolean => {
  if (error instanceof AdminApiError && error.status < 500) return false;
  return failureCount < 2;
};
