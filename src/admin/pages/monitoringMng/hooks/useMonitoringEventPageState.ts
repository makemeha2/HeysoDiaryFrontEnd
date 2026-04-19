import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdminPageContext } from '@admin/context/AdminPageContext';
import {
  diagnoseMonitoringEvent,
  getMonitoringEventDetail,
  getMonitoringEventPage,
  patchMonitoringEventResolution,
} from '../api/monitoringEventApi';
import { assertOk, AdminApiError } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type {
  MonitoringEventListItem,
  MonitoringEventPageResponse,
  MonitoringEventSearchForm,
  ResolutionYn,
} from '../types/monitoringEvent';
import {
  createDefaultMonitoringEventSearchForm,
  MONITORING_EVENT_PAGE_SIZE,
} from '../types/monitoringEvent';

const emptyPageResponse: MonitoringEventPageResponse = {
  items: [],
  page: 1,
  size: MONITORING_EVENT_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
};

export const useMonitoringEventPageState = () => {
  const queryClient = useQueryClient();
  const { handleApiError, notifyError, notifySuccess } = useAdminPageContext();
  const defaultFilters = useMemo(() => createDefaultMonitoringEventSearchForm(), []);

  const [filters, setFilters] = useState<MonitoringEventSearchForm>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<MonitoringEventSearchForm>(defaultFilters);
  const [page, setPage] = useState(1);

  const [selectedEventIds, setSelectedEventIds] = useState<Set<number>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [resolutionTarget, setResolutionTarget] = useState<ResolutionYn | null>(null);

  const pageQuery = useQuery({
    queryKey: adminKeys.monitoring.page({ ...appliedFilters, page }),
    queryFn: () =>
      getMonitoringEventPage({
        ...appliedFilters,
        page,
        size: MONITORING_EVENT_PAGE_SIZE,
      }).then(assertOk),
    staleTime: 0,
  });

  const detailQuery = useQuery({
    queryKey: adminKeys.monitoring.detail(selectedEventId!),
    queryFn: () => getMonitoringEventDetail(selectedEventId!).then(assertOk),
    enabled: selectedEventId != null,
    staleTime: 0,
  });

  // 적용 필터/페이지 변경 시 에러 초기화
  useEffect(() => {
    notifyError(null);
  }, [appliedFilters, page, notifyError]);

  // 쿼리 에러 → 컨텍스트 에러 핸들러로 위임
  useEffect(() => {
    const err = pageQuery.error ?? detailQuery.error;
    if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
  }, [pageQuery.error, detailQuery.error, handleApiError]);

  const resolutionMutation = useMutation({
    mutationFn: (payload: { eventIds: number[]; resolvedYn: ResolutionYn }) =>
      patchMonitoringEventResolution(payload).then(assertOk),
    onSuccess: async (data) => {
      notifySuccess(
        `요청 ${data.requestedCount}건 중 성공 ${data.successCount}건, 스킵 ${data.skippedCount}건, 실패 ${data.failedCount}건 처리되었습니다.`,
      );
      setSelectedEventIds(new Set());
      setSelectedEventId(null);
      setIsDetailDialogOpen(false);
      setResolutionTarget(null);
      await queryClient.invalidateQueries({
        queryKey: adminKeys.monitoring.page({ ...appliedFilters, page }),
      });
    },
    onError: (err: unknown) => {
      setResolutionTarget(null);
      if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
    },
  });

  const diagnoseMutation = useMutation({
    mutationFn: (eventId: number) => diagnoseMonitoringEvent(eventId).then(assertOk),
  });

  const handleSearch = useCallback(() => {
    setPage(1);
    setAppliedFilters({ ...filters, keyword: filters.keyword.trim() });
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    const nextDefaultFilters = createDefaultMonitoringEventSearchForm();
    setFilters(nextDefaultFilters);
    setPage(1);
    setAppliedFilters(nextDefaultFilters);
  }, []);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: adminKeys.monitoring.page({ ...appliedFilters, page }),
    });
    if (selectedEventId != null) {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.monitoring.detail(selectedEventId),
      });
    }
  }, [queryClient, appliedFilters, page, selectedEventId]);

  const handleOpenDetail = useCallback(
    (item: MonitoringEventListItem) => {
      setSelectedEventId(item.eventId);
      setIsDetailDialogOpen(true);
      queryClient.invalidateQueries({
        queryKey: adminKeys.monitoring.detail(item.eventId),
      });
    },
    [queryClient],
  );

  const toggleSelectAllCurrentPage = useCallback(
    (checked: boolean) => {
      const currentPageIds = (pageQuery.data?.items ?? []).map((item) => item.eventId);
      setSelectedEventIds((previous) => {
        const next = new Set(previous);
        currentPageIds.forEach((eventId) => {
          if (checked) {
            next.add(eventId);
          } else {
            next.delete(eventId);
          }
        });
        return next;
      });
    },
    [pageQuery.data],
  );

  const toggleSelectOne = useCallback((eventId: number, checked: boolean) => {
    setSelectedEventIds((previous) => {
      const next = new Set(previous);
      if (checked) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  }, []);

  const selectedCount = selectedEventIds.size;

  const handleOpenResolutionConfirm = useCallback(
    (resolvedYn: ResolutionYn) => {
      if (selectedCount === 0) {
        notifyError('조치할 이벤트를 먼저 선택해 주세요.');
        return;
      }
      setResolutionTarget(resolvedYn);
    },
    [notifyError, selectedCount],
  );

  const handleConfirmResolution = useCallback(() => {
    if (resolutionMutation.isPending) return;
    if (resolutionTarget == null || selectedEventIds.size === 0) {
      setResolutionTarget(null);
      return;
    }
    resolutionMutation.mutate({
      eventIds: Array.from(selectedEventIds),
      resolvedYn: resolutionTarget,
    });
  }, [resolutionMutation, resolutionTarget, selectedEventIds]);

  const pageResponse = pageQuery.data ?? emptyPageResponse;

  const pagination = useMemo(() => {
    const totalPages = pageResponse.totalPages;
    if (totalPages <= 1) return [1];
    const start = Math.max(1, page - 2);
    const end = Math.min(totalPages, start + 4);
    const normalizedStart = Math.max(1, end - 4);
    return Array.from({ length: end - normalizedStart + 1 }, (_, index) => normalizedStart + index);
  }, [page, pageResponse.totalPages]);

  return {
    filters,
    setFilters,
    appliedFilters,
    page,
    setPage,
    pageResponse,
    isListLoading: pageQuery.isFetching,
    selectedEventIds,
    selectedEventId,
    detail: detailQuery.data ?? null,
    isDetailLoading: detailQuery.isFetching,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    resolutionTarget,
    isMutatingResolution: resolutionMutation.isPending,
    diagnoseMutation,
    pagination,
    selectedCount,
    handleSearch,
    handleResetFilters,
    handleRefresh,
    handleOpenDetail,
    toggleSelectAllCurrentPage,
    toggleSelectOne,
    handleOpenResolutionConfirm,
    handleConfirmResolution,
    setResolutionTarget,
  };
};
