import { useMemo } from 'react';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import { AdminPageProvider, useAdminPageContext } from '@admin/context/AdminPageContext';
import { buildCodeColumns } from './columns/codeColumns';
import { buildCodeGroupColumns } from './columns/codeGroupColumns';
import CodeFormDialog from './components/CodeFormDialog';
import CodeGroupFormDialog from './components/CodeGroupFormDialog';
import { useComCdPageState } from './hooks/useComCdPageState';

const AdminComCdPageContent = () => {
  const { alertMessage, errorMessage, clearAlert } = useAdminPageContext();
  const {
    groupStatus,
    setGroupStatus,
    codeStatus,
    setCodeStatus,
    showEditedAt,
    setShowEditedAt,
    groups,
    codes,
    groupsQuery,
    codesQuery,
    selectedGroupId,
    setSelectedGroupId,
    selectedCodeId,
    setSelectedCodeId,
    selectedGroup,
    isGroupDialogOpen,
    setIsGroupDialogOpen,
    isCodeDialogOpen,
    setIsCodeDialogOpen,
    editingGroup,
    editingCode,
    isGroupMutating,
    isCodeMutating,
    handleRefreshGroups,
    handleRefreshCodes,
    handleOpenCreateGroupDialog,
    handleOpenEditGroupDialog,
    handleGroupSubmit,
    handleOpenCreateCodeDialog,
    handleOpenEditCodeDialog,
    handleCodeSubmit,
  } = useComCdPageState();

  const groupColumns = useMemo(
    () => buildCodeGroupColumns({ showEditedAt, onEdit: handleOpenEditGroupDialog }),
    [showEditedAt, handleOpenEditGroupDialog],
  );

  const codeColumns = useMemo(
    () => buildCodeColumns({ showEditedAt, onEdit: handleOpenEditCodeDialog }),
    [showEditedAt, handleOpenEditCodeDialog],
  );

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">공통코드 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">그룹과 코드를 등록/수정 모달로 관리합니다.</p>
        </div>

        <label className="flex items-center gap-2 rounded-md border border-sand/70 bg-white px-2 py-1 text-xs text-clay sm:text-sm">
          <input
            type="checkbox"
            checked={showEditedAt}
            onChange={(event) => setShowEditedAt(event.target.checked)}
          />
          편집일시
        </label>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[3fr_7fr]">
        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">공통코드그룹</h2>
            <div className="flex items-center gap-2">
              <StatusFilterSelect value={groupStatus} onChange={setGroupStatus} />
              <button
                type="button"
                onClick={handleRefreshGroups}
                disabled={groupsQuery.isFetching}
                className="rounded border border-sand px-2 py-1 text-xs text-clay disabled:opacity-50 sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreateGroupDialog}
                disabled={isGroupMutating}
                className="rounded bg-clay px-2 py-1 text-xs text-white disabled:opacity-50 sm:text-sm"
              >
                등록
              </button>
            </div>
          </div>

          <AdminDataTable
            data={groups}
            columns={groupColumns}
            rowKey={(row) => row.groupId}
            onRowClick={(row) => setSelectedGroupId(row.groupId)}
            selectedKey={selectedGroupId}
            emptyMessage={groupsQuery.isLoading ? '불러오는 중...' : '그룹 데이터가 없습니다.'}
            maxHeightClassName="max-h-[360px]"
          />

          {selectedGroup && (
            <p className="text-xs text-clay/80 sm:text-sm">
              선택 그룹: <strong>{selectedGroup.groupId}</strong>
            </p>
          )}
        </section>

        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">공통코드</h2>
            <div className="flex items-center gap-2">
              <StatusFilterSelect value={codeStatus} onChange={setCodeStatus} />
              <button
                type="button"
                onClick={handleRefreshCodes}
                disabled={codesQuery.isFetching}
                className="rounded border border-sand px-2 py-1 text-xs text-clay disabled:opacity-50 sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreateCodeDialog}
                disabled={isCodeMutating}
                className="rounded bg-clay px-2 py-1 text-xs text-white disabled:opacity-50 sm:text-sm"
              >
                등록
              </button>
            </div>
          </div>

          <AdminDataTable
            data={codes}
            columns={codeColumns}
            rowKey={(row) => row.codeId}
            onRowClick={(row) => setSelectedCodeId(row.codeId)}
            selectedKey={selectedCodeId}
            emptyMessage={codesQuery.isLoading ? '불러오는 중...' : '코드 데이터가 없습니다.'}
            maxHeightClassName="max-h-[360px]"
          />
        </section>
      </div>

      <CodeGroupFormDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        group={editingGroup}
        onSubmit={handleGroupSubmit}
      />

      <CodeFormDialog
        open={isCodeDialogOpen}
        onOpenChange={setIsCodeDialogOpen}
        selectedGroupId={selectedGroupId}
        code={editingCode}
        onSubmit={handleCodeSubmit}
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

const AdminComCdPage = () => (
  <AdminPageProvider>
    <AdminComCdPageContent />
  </AdminPageProvider>
);

export default AdminComCdPage;
