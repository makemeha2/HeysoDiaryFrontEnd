import { adminFetch } from '@admin/lib/api';
import type {
  BatchExecuteResponse,
  BatchExecutionPageResponse,
  BatchExecutionSearchParams,
  BatchListResponse,
} from '../types/batchMng';

export async function getBatchList() {
  return adminFetch<BatchListResponse>('/api/admin/batches');
}

export async function getBatchExecutionPage(batchKey: string, params: BatchExecutionSearchParams) {
  return adminFetch<BatchExecutionPageResponse>(`/api/admin/batches/${batchKey}/executions`, {
    params,
  });
}

export async function executeBatch(batchKey: string) {
  return adminFetch<BatchExecuteResponse>(`/api/admin/batches/${batchKey}/execute`, {
    method: 'POST',
  });
}
