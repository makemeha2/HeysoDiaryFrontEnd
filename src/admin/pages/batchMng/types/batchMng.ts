export type BatchExecutionStatus = 'RUNNING' | 'SUCCESS' | 'FAILED';
export type BatchTriggerType = 'AUTO' | 'MANUAL';

export type BatchExecution = {
  executionId: number;
  batchKey: string;
  triggerType: BatchTriggerType;
  status: BatchExecutionStatus;
  requestedBy: number | null;
  requestedByEmail: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  durationMs: number | null;
  successCount: number;
  failureCount: number;
  message: string | null;
  errorMessage: string | null;
};

export type AdminBatch = {
  batchKey: string;
  name: string;
  description: string;
  cronExpression: string;
  zone: string;
  running: boolean;
  latestExecution: BatchExecution | null;
};

export type BatchListResponse = {
  items: AdminBatch[];
};

export type BatchExecutionPageResponse = {
  items: BatchExecution[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

export type BatchExecuteResponse = {
  executionId: number;
  batchKey: string;
  status: BatchExecutionStatus;
};

export type BatchExecutionSearchParams = {
  page: number;
  size: number;
};

export const BATCH_EXECUTION_PAGE_SIZE = 20;

export const emptyBatchExecutionPage: BatchExecutionPageResponse = {
  items: [],
  page: 1,
  size: BATCH_EXECUTION_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
};
