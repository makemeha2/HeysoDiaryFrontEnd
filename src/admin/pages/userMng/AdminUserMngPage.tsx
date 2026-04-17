import { useMemo } from 'react';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminPaginationButton from '@admin/components/common/AdminPaginationButton';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import AdminConfirmDialog from '@admin/components/common/dialog/AdminConfirmDialog';
import { AdminPageProvider, useAdminPageContext } from '@admin/context/AdminPageContext';
import { buildUserColumns } from './columns/userColumns';
import UserCreateDialog from './components/UserCreateDialog';
import UserDetailModal from './components/UserDetailModal';
import UserPasswordResetDialog from './components/UserPasswordResetDialog';
import UserStatusDialog from './components/UserStatusDialog';
import UserUpdateDialog from './components/UserUpdateDialog';
import { useUserMngPageState } from './hooks/useUserMngPageState';
import type { UserSearchForm } from './types/userMng';
import {
  USER_AUTH_PROVIDER_OPTIONS,
  USER_ROLE_LABEL,
  USER_ROLE_OPTIONS,
  USER_STATUS_FILTER_OPTIONS,
  USER_STATUS_LABEL,
  canResetOrDeleteUser,
  isWithdrawnUser,
} from './types/userMng';

const AdminUserMngPageContent = () => {
  const { alertMessage, errorMessage, clearAlert } = useAdminPageContext();
  const {
    filters,
    setFilters,
    page,
    setPage,
    pageResponse,
    isListLoading,
    currentUserId,
    activeUser,
    detail,
    isDetailLoading,
    isDetailDialogOpen,
    setIsDetailDialogOpen,
    isCreateDialogOpen,
    setIsCreateDialogOpen,
    isUpdateDialogOpen,
    setIsUpdateDialogOpen,
    isStatusDialogOpen,
    setIsStatusDialogOpen,
    isPasswordDialogOpen,
    setIsPasswordDialogOpen,
    deleteTarget,
    setDeleteTarget,
    isMutating,
    pagination,
    handleSearch,
    handleResetFilters,
    handleRefresh,
    handleOpenDetail,
    handleOpenCreateDialog,
    handleOpenUpdateDialog,
    handleOpenStatusDialog,
    handleOpenPasswordDialog,
    handleOpenDeleteDialog,
    handleCreateUser,
    handleUpdateUser,
    handleUpdateStatus,
    handleResetPassword,
    handleDeleteUser,
  } = useUserMngPageState();

  const columns = useMemo(
    () =>
      buildUserColumns({
        currentUserId,
        onOpenDetail: handleOpenDetail,
        onOpenUpdate: handleOpenUpdateDialog,
        onOpenStatus: handleOpenStatusDialog,
        onOpenPassword: handleOpenPasswordDialog,
        onOpenDelete: handleOpenDeleteDialog,
      }),
    [
      currentUserId,
      handleOpenDeleteDialog,
      handleOpenDetail,
      handleOpenPasswordDialog,
      handleOpenStatusDialog,
      handleOpenUpdateDialog,
    ],
  );

  const updateFilter = <K extends keyof UserSearchForm>(key: K, value: UserSearchForm[K]) => {
    setFilters((previous) => ({ ...previous, [key]: value }));
  };

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">회원 관리</h1>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <section className="overflow-x-auto rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div className="flex min-w-max flex-wrap items-center gap-2 text-xs text-clay">
          <label className="flex items-center gap-1 whitespace-nowrap">
            <span>검색어</span>
            <input
              type="text"
              value={filters.keyword}
              onChange={(event) => updateFilter('keyword', event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
              placeholder="email / nickname / loginId"
              className="min-w-[220px] rounded border border-sand px-2 py-1 text-xs"
            />
          </label>

          <label className="flex items-center gap-1 whitespace-nowrap">
            <span>권한</span>
            <select
              value={filters.role}
              onChange={(event) => updateFilter('role', event.target.value as UserSearchForm['role'])}
              className="rounded border border-sand px-2 py-1 text-xs"
            >
              <option value="">전체</option>
              {USER_ROLE_OPTIONS.map((role) => (
                <option key={role} value={role}>
                  {USER_ROLE_LABEL[role]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1 whitespace-nowrap">
            <span>상태</span>
            <select
              value={filters.status}
              onChange={(event) => updateFilter('status', event.target.value as UserSearchForm['status'])}
              className="rounded border border-sand px-2 py-1 text-xs"
            >
              <option value="">전체</option>
              {USER_STATUS_FILTER_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {USER_STATUS_LABEL[status]}
                </option>
              ))}
            </select>
          </label>

          <label className="flex items-center gap-1 whitespace-nowrap">
            <span>인증방식</span>
            <select
              value={filters.authProvider}
              onChange={(event) =>
                updateFilter('authProvider', event.target.value as UserSearchForm['authProvider'])
              }
              className="rounded border border-sand px-2 py-1 text-xs"
            >
              <option value="">전체</option>
              {USER_AUTH_PROVIDER_OPTIONS.map((provider) => (
                <option key={provider} value={provider}>
                  {provider}
                </option>
              ))}
            </select>
          </label>

          <div className="ml-2 flex items-center gap-2">
            <button
              type="button"
              onClick={handleSearch}
              className="rounded bg-clay px-3 py-1 text-xs text-white"
            >
              조회
            </button>
            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded border border-sand px-2 py-1 text-xs text-clay"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleRefresh}
              className="rounded border border-sand px-2 py-1 text-xs text-clay"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={handleOpenCreateDialog}
              className="rounded border border-clay bg-white px-3 py-1 text-xs text-clay"
            >
              신규 LOCAL 회원 등록
            </button>
          </div>
        </div>
      </section>

      <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-clay">회원 목록</h2>
          </div>
          {/*activeUser && (
            <div className="text-xs text-clay/70 sm:text-sm">
              선택 회원: {activeUser.email}
              {isWithdrawnUser(activeUser) ? ' · 읽기 전용' : ''}
              {!canResetOrDeleteUser(activeUser) ? ' · 비LOCAL' : ''}
            </div>
          )*/}
        </div>

        <AdminDataTable
          data={pageResponse.items}
          columns={columns}
          rowKey={(row) => String(row.userId)}
          selectedKey={activeUser != null ? String(activeUser.userId) : null}
          emptyMessage={isListLoading ? '회원 목록을 불러오는 중입니다.' : '조회된 회원이 없습니다.'}
          tableClassName="min-w-[1480px]"
          maxHeightClassName="max-h-[540px]"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-clay/70 sm:text-sm">
              총 {pageResponse.totalCount}건 · 페이지 {pageResponse.page} / {pageResponse.totalPages || 1}
            </p>
          <div className="flex flex-wrap items-center gap-2">
            <AdminPaginationButton
              disabled={page <= 1 || isListLoading}
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              이전
            </AdminPaginationButton>
            {pagination.map((pageNo) => (
              <AdminPaginationButton
                key={pageNo}
                active={pageNo === page}
                disabled={isListLoading}
                onClick={() => setPage(pageNo)}
              >
                {pageNo}
              </AdminPaginationButton>
            ))}
            <AdminPaginationButton
              disabled={page >= Math.max(1, pageResponse.totalPages) || isListLoading}
              onClick={() => setPage(Math.min(Math.max(1, pageResponse.totalPages), page + 1))}
            >
              다음
            </AdminPaginationButton>
          </div>
        </div>
      </section>

      <UserDetailModal
        open={isDetailDialogOpen}
        onOpenChange={setIsDetailDialogOpen}
        detail={detail}
        isLoading={isDetailLoading}
      />

      <UserCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        isSubmitting={isMutating}
        onSubmit={handleCreateUser}
      />

      <UserUpdateDialog
        open={isUpdateDialogOpen}
        onOpenChange={setIsUpdateDialogOpen}
        detail={detail}
        currentUserId={currentUserId}
        isSubmitting={isMutating}
        onSubmit={handleUpdateUser}
      />

      <UserStatusDialog
        open={isStatusDialogOpen}
        onOpenChange={setIsStatusDialogOpen}
        detail={detail}
        currentUserId={currentUserId}
        isSubmitting={isMutating}
        onSubmit={handleUpdateStatus}
      />

      <UserPasswordResetDialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
        detail={detail}
        isSubmitting={isMutating}
        onSubmit={handleResetPassword}
      />

      <AdminConfirmDialog
        open={deleteTarget != null}
        onOpenChange={(open) => {
          if (!open && !isMutating) {
            setDeleteTarget(null);
          }
        }}
        title="회원 삭제 확인"
        description={
          deleteTarget
            ? `${deleteTarget.email} 계정을 삭제합니다. LOCAL 계정만 삭제할 수 있으며, 삭제 후 복구할 수 없습니다.`
            : ''
        }
        confirmLabel={isMutating ? '삭제 중...' : '삭제'}
        onConfirm={handleDeleteUser}
        disabled={isMutating}
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

const AdminUserMngPage = () => (
  <AdminPageProvider>
    <AdminUserMngPageContent />
  </AdminPageProvider>
);

export default AdminUserMngPage;
