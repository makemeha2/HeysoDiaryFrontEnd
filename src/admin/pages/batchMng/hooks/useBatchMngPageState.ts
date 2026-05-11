import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminPageContext } from '@admin/context/AdminPageContext';
import { adminKeys } from '@admin/lib/queryKeys';
import { AdminApiError, assertOk } from '@admin/lib/queryClientHelpers';
import { executeBatch, getBatchExecutionPage, getBatchList } from '../api/batchApi';
import type { AdminBatch } from '../types/batchMng';
import { BATCH_EXECUTION_PAGE_SIZE, emptyBatchExecutionPage } from '../types/batchMng';

export const useBatchMngPageState = () => {
  const queryClient = useQueryClient();
  const { handleApiError, notifyError, notifySuccess } = useAdminPageContext();
  const [selectedBatchKey, setSelectedBatchKey] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [executeTarget, setExecuteTarget] = useState<AdminBatch | null>(null);

  const batchQuery = useQuery({
    queryKey: adminKeys.batch.list(),
    queryFn: () => getBatchList().then(assertOk),
    staleTime: 0,
  });

  const batches = useMemo(() => batchQuery.data?.items ?? [], [batchQuery.data?.items]);
  const selectedBatch = batches.find((batch) => batch.batchKey === selectedBatchKey) ?? batches[0] ?? null;
  const effectiveBatchKey = selectedBatch?.batchKey ?? null;

  useEffect(() => {
    if (!selectedBatchKey && batches.length > 0) {
      setSelectedBatchKey(batches[0].batchKey);
    }
  }, [batches, selectedBatchKey]);

  const executionQuery = useQuery({
    queryKey: effectiveBatchKey
      ? adminKeys.batch.executions(effectiveBatchKey, { page })
      : adminKeys.batch.executions('', { page }),
    queryFn: () =>
      getBatchExecutionPage(effectiveBatchKey!, {
        page,
        size: BATCH_EXECUTION_PAGE_SIZE,
      }).then(assertOk),
    enabled: effectiveBatchKey != null,
    staleTime: 0,
  });

  useEffect(() => {
    notifyError(null);
  }, [page, effectiveBatchKey, notifyError]);

  useEffect(() => {
    const err = batchQuery.error ?? executionQuery.error;
    if (err instanceof AdminApiError) {
      handleApiError(err.status, err.errorMessage);
    }
  }, [batchQuery.error, executionQuery.error, handleApiError]);

  const invalidateBatchData = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.batch.all() });
  }, [queryClient]);

  const executeMutation = useMutation({
    mutationFn: (batchKey: string) => executeBatch(batchKey).then(assertOk),
    onSuccess: async () => {
      notifySuccess('배치 실행을 시작했습니다.');
      setExecuteTarget(null);
      await invalidateBatchData();
    },
    onError: (err) => {
      if (err instanceof AdminApiError && err.status === 409) {
        notifyError('이미 실행 중인 배치입니다.');
        setExecuteTarget(null);
        invalidateBatchData();
        return;
      }
      if (err instanceof AdminApiError) {
        handleApiError(err.status, err.errorMessage);
      }
    },
  });

  const handleSelectBatch = useCallback((batch: AdminBatch) => {
    setSelectedBatchKey(batch.batchKey);
    setPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    await invalidateBatchData();
  }, [invalidateBatchData]);

  const handleConfirmExecute = useCallback(async () => {
    if (!executeTarget) return;
    await executeMutation.mutateAsync(executeTarget.batchKey);
  }, [executeMutation, executeTarget]);

  const executionPage = executionQuery.data ?? emptyBatchExecutionPage;
  const pagination = useMemo(() => {
    const totalPages = executionPage.totalPages;
    if (totalPages <= 1) return [1];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);
    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
  }, [page, executionPage.totalPages]);

  return {
    batches,
    selectedBatch,
    selectedBatchKey: effectiveBatchKey,
    page,
    setPage,
    executionPage,
    pagination,
    executeTarget,
    setExecuteTarget,
    isBatchLoading: batchQuery.isFetching,
    isExecutionLoading: executionQuery.isFetching,
    isExecuting: executeMutation.isPending,
    handleSelectBatch,
    handleRefresh,
    handleConfirmExecute,
  };
};
