import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminPageContext } from '@admin/context/AdminPageContext';
import {
  getMonitoringEventDetail,
  getMonitoringEventPage,
  patchMonitoringEventResolution,
} from '@admin/lib/monitoringEventApi';
import type {
  MonitoringEventDetail,
  MonitoringEventListItem,
  MonitoringEventPageResponse,
  MonitoringEventSearchForm,
  ResolutionYn,
} from '../types/monitoringEvent';
import {
  defaultMonitoringEventSearchForm,
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
  const { handleApiError, notifyError, notifySuccess } = useAdminPageContext();

  const [filters, setFilters] = useState<MonitoringEventSearchForm>(defaultMonitoringEventSearchForm);
  const [appliedFilters, setAppliedFilters] = useState<MonitoringEventSearchForm>(defaultMonitoringEventSearchForm);
  const [page, setPage] = useState(1);
  const [pageResponse, setPageResponse] = useState<MonitoringEventPageResponse>(emptyPageResponse);
  const [isListLoading, setIsListLoading] = useState(false);

  const [selectedEventIds, setSelectedEventIds] = useState<Set<number>>(new Set());
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [detail, setDetail] = useState<MonitoringEventDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [resolutionTarget, setResolutionTarget] = useState<ResolutionYn | null>(null);
  const [isMutatingResolution, setIsMutatingResolution] = useState(false);

  const loadPage = useCallback(
    async (targetPage: number, targetFilters: MonitoringEventSearchForm) => {
      setIsListLoading(true);
      notifyError(null);

      const result = await getMonitoringEventPage({
        ...targetFilters,
        page: targetPage,
        size: MONITORING_EVENT_PAGE_SIZE,
      });

      setIsListLoading(false);

      if (!result.ok) {
        handleApiError(result.status, result.errorMessage ?? '모니터링 이벤트 목록을 불러오지 못했습니다.');
        return;
      }

      setPageResponse(result.data ?? emptyPageResponse);
    },
    [handleApiError, notifyError],
  );

  const loadDetail = useCallback(
    async (eventId: number) => {
      setIsDetailLoading(true);
      notifyError(null);
      const result = await getMonitoringEventDetail(eventId);
      setIsDetailLoading(false);

      if (!result.ok) {
        setDetail(null);
        handleApiError(result.status, result.errorMessage ?? '모니터링 이벤트 상세를 불러오지 못했습니다.');
        return;
      }

      setDetail(result.data ?? null);
    },
    [handleApiError, notifyError],
  );

  useEffect(() => {
    loadPage(page, appliedFilters);
  }, [appliedFilters, loadPage, page]);

  const handleSearch = useCallback(() => {
    setSelectedEventIds(new Set());
    setSelectedEventId(null);
    setDetail(null);
    setPage(1);
    setAppliedFilters({ ...filters, keyword: filters.keyword.trim() });
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    setFilters(defaultMonitoringEventSearchForm);
    setSelectedEventIds(new Set());
    setSelectedEventId(null);
    setDetail(null);
    setPage(1);
    setAppliedFilters(defaultMonitoringEventSearchForm);
  }, []);

  const handleRefresh = useCallback(() => {
    loadPage(page, appliedFilters);
    if (selectedEventId != null) {
      loadDetail(selectedEventId);
    }
  }, [appliedFilters, loadDetail, loadPage, page, selectedEventId]);

  const handleSelectRow = useCallback(
    (item: MonitoringEventListItem) => {
      setSelectedEventId(item.eventId);
      loadDetail(item.eventId);
    },
    [loadDetail],
  );

  const toggleSelectAllCurrentPage = useCallback(
    (checked: boolean) => {
      const currentPageIds = pageResponse.items.map((item) => item.eventId);
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
    [pageResponse.items],
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

  const handleOpenResolutionConfirm = useCallback((resolvedYn: ResolutionYn) => {
    if (selectedCount === 0) {
      notifyError('조치할 이벤트를 먼저 선택해 주세요.');
      return;
    }
    setResolutionTarget(resolvedYn);
  }, [notifyError, selectedCount]);

  const handleConfirmResolution = useCallback(async () => {
    if (isMutatingResolution) return;
    if (resolutionTarget == null || selectedEventIds.size === 0) {
      setResolutionTarget(null);
      return;
    }

    setIsMutatingResolution(true);
    const result = await patchMonitoringEventResolution({
      eventIds: Array.from(selectedEventIds),
      resolvedYn: resolutionTarget,
    });
    setIsMutatingResolution(false);
    setResolutionTarget(null);

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '일괄 조치 처리에 실패했습니다.');
      return;
    }

    const response = result.data;
    notifySuccess(
      `요청 ${response.requestedCount}건 중 성공 ${response.successCount}건, 스킵 ${response.skippedCount}건, 실패 ${response.failedCount}건 처리되었습니다.`,
    );

    setSelectedEventIds(new Set());
    setSelectedEventId(null);
    setDetail(null);
    await loadPage(page, appliedFilters);
  }, [appliedFilters, handleApiError, isMutatingResolution, loadPage, notifySuccess, page, resolutionTarget, selectedEventIds]);

  const pagination = useMemo(() => {
    const totalPages = pageResponse.totalPages;
    if (totalPages <= 1) {
      return [1];
    }

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
    isListLoading,
    selectedEventIds,
    selectedEventId,
    detail,
    isDetailLoading,
    resolutionTarget,
    isMutatingResolution,
    pagination,
    selectedCount,
    handleSearch,
    handleResetFilters,
    handleRefresh,
    handleSelectRow,
    toggleSelectAllCurrentPage,
    toggleSelectOne,
    handleOpenResolutionConfirm,
    handleConfirmResolution,
    setResolutionTarget,
  };
};
