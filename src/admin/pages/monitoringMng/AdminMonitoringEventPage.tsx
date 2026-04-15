import { useMemo } from 'react';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import AdminConfirmDialog from '@admin/components/common/dialog/AdminConfirmDialog';
import { AdminPageProvider, useAdminPageContext } from '@admin/context/AdminPageContext';
import MonitoringEventDetailPanel from './components/MonitoringEventDetailPanel';
import { buildMonitoringEventColumns } from './columns/monitoringEventColumns';
import { useMonitoringEventPageState } from './hooks/useMonitoringEventPageState';
import type { MonitoringEventSearchForm } from './types/monitoringEvent';

const eventTypeOptions = ['', 'ERROR', 'WARN', 'INFO', 'SECURITY', 'BUSINESS'] as const;
const severityOptions = ['', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

const PaginationButton = ({
  active,
  disabled,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={onClick}
    className={`rounded border px-2 py-1 text-xs sm:text-sm ${
      active ? 'border-clay bg-clay text-white' : 'border-sand text-clay'
    } ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-amber/10'}`}
  >
    {children}
  </button>
);

const AdminMonitoringEventPageContent = () => {
  const { alertMessage, errorMessage, clearAlert } = useAdminPageContext();
  const {
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
  } = useMonitoringEventPageState();

  const columns = useMemo(
    () =>
      buildMonitoringEventColumns({
        selectedIds: selectedEventIds,
        currentPageIds: pageResponse.items.map((item) => item.eventId),
        onToggleAll: toggleSelectAllCurrentPage,
        onToggleOne: toggleSelectOne,
      }),
    [pageResponse.items, selectedEventIds, toggleSelectAllCurrentPage, toggleSelectOne],
  );

  const updateFilter = <K extends keyof MonitoringEventSearchForm>(key: K, value: MonitoringEventSearchForm[K]) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">모니터링 이벤트 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">tb_monitoring_event 데이터를 조회하고 조치 상태를 관리합니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <section className="rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <label className="grid gap-1 text-xs text-clay sm:text-sm">
            발생 시작일
            <input
              type="date"
              value={filters.startDate}
              onChange={(event) => updateFilter('startDate', event.target.value)}
              className="rounded border border-sand px-2 py-1"
            />
          </label>
          <label className="grid gap-1 text-xs text-clay sm:text-sm">
            발생 종료일
            <input
              type="date"
              value={filters.endDate}
              onChange={(event) => updateFilter('endDate', event.target.value)}
              className="rounded border border-sand px-2 py-1"
            />
          </label>
          <label className="grid gap-1 text-xs text-clay sm:text-sm">
            조치 여부
            <select
              value={filters.resolvedYn}
              onChange={(event) => updateFilter('resolvedYn', event.target.value as MonitoringEventSearchForm['resolvedYn'])}
              className="rounded border border-sand px-2 py-1"
            >
              <option value="">전체</option>
              <option value="N">N</option>
              <option value="Y">Y</option>
            </select>
          </label>
          <label className="grid gap-1 text-xs text-clay sm:text-sm">
            이벤트 유형
            <select
              value={filters.eventType}
              onChange={(event) => updateFilter('eventType', event.target.value as MonitoringEventSearchForm['eventType'])}
              className="rounded border border-sand px-2 py-1"
            >
              <option value="">전체</option>
              {eventTypeOptions.filter(Boolean).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-clay sm:text-sm">
            심각도
            <select
              value={filters.severity}
              onChange={(event) => updateFilter('severity', event.target.value as MonitoringEventSearchForm['severity'])}
              className="rounded border border-sand px-2 py-1"
            >
              <option value="">전체</option>
              {severityOptions.filter(Boolean).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-clay sm:text-sm xl:col-span-1">
            통합 검색어
            <input
              type="text"
              value={filters.keyword}
              onChange={(event) => updateFilter('keyword', event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="event_code, title, message, request_uri, trace_id, exception_class"
              className="rounded border border-sand px-2 py-1"
            />
          </label>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-clay/70 sm:text-sm">
            기본 정렬: created_at DESC, event_id DESC / 현재 필터 resolved_yn={appliedFilters.resolvedYn || 'ALL'}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleSearch}
              className="rounded bg-clay px-3 py-1 text-xs text-white sm:text-sm"
            >
              조회
            </button>
          </div>
        </div>
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.8fr)_minmax(320px,1fr)]">
        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-semibold text-clay">이벤트 목록</h2>
              <p className="text-xs text-clay/70 sm:text-sm">
                총 {pageResponse.totalCount}건 · 페이지 {pageResponse.page} / {pageResponse.totalPages || 1}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-clay/70 sm:text-sm">선택 {selectedCount}건</span>
              <button
                type="button"
                onClick={() => handleOpenResolutionConfirm('Y')}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                Y 조치
              </button>
              <button
                type="button"
                onClick={() => handleOpenResolutionConfirm('N')}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                N 조치
              </button>
              <button
                type="button"
                onClick={handleRefresh}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                새로고침
              </button>
            </div>
          </div>

          <AdminDataTable
            data={pageResponse.items}
            columns={columns}
            rowKey={(row) => String(row.eventId)}
            onRowClick={handleSelectRow}
            selectedKey={selectedEventId != null ? String(selectedEventId) : null}
            emptyMessage={isListLoading ? '목록을 불러오는 중입니다.' : '조회된 모니터링 이벤트가 없습니다.'}
            maxHeightClassName="max-h-[540px]"
            tableClassName="min-w-[1650px]"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-clay/70 sm:text-sm">페이지당 20건</p>
            <div className="flex flex-wrap items-center gap-2">
              <PaginationButton
                disabled={page <= 1 || isListLoading}
                onClick={() => setPage(Math.max(1, page - 1))}
              >
                이전
              </PaginationButton>
              {pagination.map((pageNo) => (
                <PaginationButton
                  key={pageNo}
                  active={pageNo === page}
                  disabled={isListLoading}
                  onClick={() => setPage(pageNo)}
                >
                  {pageNo}
                </PaginationButton>
              ))}
              <PaginationButton
                disabled={page >= Math.max(1, pageResponse.totalPages) || isListLoading}
                onClick={() => setPage(Math.min(Math.max(1, pageResponse.totalPages), page + 1))}
              >
                다음
              </PaginationButton>
            </div>
          </div>
        </section>

        <MonitoringEventDetailPanel detail={detail} isLoading={isDetailLoading} />
      </div>

      <AdminConfirmDialog
        open={resolutionTarget != null}
        onOpenChange={(open) => {
          if (!open && !isMutatingResolution) {
            setResolutionTarget(null);
          }
        }}
        title="일괄 조치 확인"
        description={`선택한 ${selectedCount}건의 resolved_yn 값을 ${resolutionTarget ?? '-'}로 변경합니다.`}
        confirmLabel={isMutatingResolution ? '처리 중...' : '확인'}
        onConfirm={handleConfirmResolution}
        disabled={isMutatingResolution}
      />

      <AdminAlertDialog
        open={!!alertMessage}
        onOpenChange={(open) => {
          if (!open) {
            clearAlert();
          }
        }}
        title="알림"
        description={alertMessage ?? ''}
      />
    </div>
  );
};

const AdminMonitoringEventPage = () => (
  <AdminPageProvider>
    <AdminMonitoringEventPageContent />
  </AdminPageProvider>
);

export default AdminMonitoringEventPage;
