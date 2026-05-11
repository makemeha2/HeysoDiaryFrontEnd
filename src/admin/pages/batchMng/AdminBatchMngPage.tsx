import { useMemo } from 'react';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminPaginationButton from '@admin/components/common/AdminPaginationButton';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import AdminConfirmDialog from '@admin/components/common/dialog/AdminConfirmDialog';
import { AdminPageProvider, useAdminPageContext } from '@admin/context/AdminPageContext';
import { buildBatchColumns, buildBatchExecutionColumns } from './columns/batchColumns';
import { useBatchMngPageState } from './hooks/useBatchMngPageState';

const AdminBatchMngPageContent = () => {
  const { alertMessage, errorMessage, clearAlert } = useAdminPageContext();
  const {
    batches,
    selectedBatch,
    selectedBatchKey,
    page,
    setPage,
    executionPage,
    pagination,
    executeTarget,
    setExecuteTarget,
    isBatchLoading,
    isExecutionLoading,
    isExecuting,
    handleSelectBatch,
    handleRefresh,
    handleConfirmExecute,
  } = useBatchMngPageState();

  const batchColumns = useMemo(
    () =>
      buildBatchColumns({
        onExecute: setExecuteTarget,
        isExecuting,
      }),
    [isExecuting, setExecuteTarget],
  );
  const executionColumns = useMemo(() => buildBatchExecutionColumns(), []);

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">배치 관리</h1>
          <p className="mt-1 text-xs text-clay/70 sm:text-sm">
            예약 배치의 최근 실행 상태와 실행 이력을 확인하고 수동 실행합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
        >
          새로고침
        </button>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div>
          <h2 className="font-semibold text-clay">배치 목록</h2>
          <p className="text-xs text-clay/70 sm:text-sm">총 {batches.length}건</p>
        </div>

        <AdminDataTable
          data={batches}
          columns={batchColumns}
          rowKey={(row) => row.batchKey}
          onRowClick={handleSelectBatch}
          selectedKey={selectedBatchKey}
          emptyMessage={isBatchLoading ? '목록을 불러오는 중입니다.' : '등록된 배치가 없습니다.'}
          maxHeightClassName="max-h-[360px]"
          tableClassName="min-w-[1200px]"
        />
      </section>

      <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-clay">실행 이력</h2>
            <p className="text-xs text-clay/70 sm:text-sm">
              {selectedBatch?.name ?? '배치 미선택'} · 총 {executionPage.totalCount}건 · 페이지{' '}
              {executionPage.page} / {executionPage.totalPages || 1}
            </p>
          </div>
        </div>

        <AdminDataTable
          data={executionPage.items}
          columns={executionColumns}
          rowKey={(row) => String(row.executionId)}
          emptyMessage={isExecutionLoading ? '이력을 불러오는 중입니다.' : '실행 이력이 없습니다.'}
          maxHeightClassName="max-h-[460px]"
          tableClassName="min-w-[1300px]"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-clay/70 sm:text-sm">페이지당 20건</p>
          <div className="flex flex-wrap items-center gap-2">
            <AdminPaginationButton
              disabled={page <= 1 || isExecutionLoading}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              이전
            </AdminPaginationButton>
            {pagination.map((pageNo) => (
              <AdminPaginationButton
                key={pageNo}
                active={pageNo === page}
                disabled={isExecutionLoading}
                onClick={() => setPage(pageNo)}
              >
                {pageNo}
              </AdminPaginationButton>
            ))}
            <AdminPaginationButton
              disabled={page >= Math.max(1, executionPage.totalPages) || isExecutionLoading}
              onClick={() => setPage(Math.min(Math.max(1, executionPage.totalPages), page + 1))}
            >
              다음
            </AdminPaginationButton>
          </div>
        </div>
      </section>

      <AdminConfirmDialog
        open={executeTarget != null}
        onOpenChange={(open) => {
          if (!open && !isExecuting) {
            setExecuteTarget(null);
          }
        }}
        title="배치 수동 실행"
        description={`${executeTarget?.name ?? '-'} 배치를 수동으로 실행합니다.`}
        confirmLabel={isExecuting ? '실행 요청 중...' : '실행'}
        onConfirm={handleConfirmExecute}
        disabled={isExecuting}
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

const AdminBatchMngPage = () => (
  <AdminPageProvider>
    <AdminBatchMngPageContent />
  </AdminPageProvider>
);

export default AdminBatchMngPage;
