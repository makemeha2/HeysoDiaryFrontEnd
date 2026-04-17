import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAdminPageContext } from '@admin/context/AdminPageContext';
import { getAdminUserId } from '@admin/lib/auth';
import {
  createLocalUser,
  deleteUser,
  getUserDetail,
  getUserPage,
  resetUserPassword,
  updateUser,
  updateUserStatus,
} from '../api/userApi';
import type { AdminApiResult } from '@admin/lib/api';
import type {
  CreateLocalUserRequest,
  ResetUserPasswordRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserDetail,
  UserListItem,
  UserPageResponse,
  UserSearchForm,
} from '../types/userMng';
import {
  USER_CONFLICT_MESSAGE_MAP,
  USER_PAGE_SIZE,
  createDefaultUserSearchForm,
} from '../types/userMng';

const emptyPageResponse: UserPageResponse = {
  items: [],
  page: 1,
  size: USER_PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
};

export const useUserMngPageState = () => {
  const { handleApiError, notifyError, notifySuccess } = useAdminPageContext();
  const defaultFilters = useMemo(() => createDefaultUserSearchForm(), []);

  const [filters, setFilters] = useState<UserSearchForm>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<UserSearchForm>(defaultFilters);
  const [page, setPage] = useState(1);
  const [pageResponse, setPageResponse] = useState<UserPageResponse>(emptyPageResponse);
  const [isListLoading, setIsListLoading] = useState(false);

  const [currentUserId] = useState<number | null>(() => getAdminUserId());

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const [activeUser, setActiveUser] = useState<UserListItem | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const resolveErrorMessage = useCallback(
    (result: AdminApiResult, fallback: string) => {
      if (result.status === 409) {
        const mapped = result.errorCode ? USER_CONFLICT_MESSAGE_MAP[result.errorCode] : null;
        if (mapped) {
          notifyError(mapped);
          return;
        }
      }

      handleApiError(result.status, result.errorMessage ?? fallback);
    },
    [handleApiError, notifyError],
  );

  const loadPage = useCallback(
    async (targetPage: number, targetFilters: UserSearchForm) => {
      setIsListLoading(true);
      notifyError(null);

      const result = await getUserPage({
        ...targetFilters,
        page: targetPage,
        size: USER_PAGE_SIZE,
      });

      setIsListLoading(false);

      if (!result.ok) {
        resolveErrorMessage(result, '회원 목록을 불러오지 못했습니다.');
        return;
      }

      setPageResponse(result.data ?? emptyPageResponse);
    },
    [notifyError, resolveErrorMessage],
  );

  const loadDetail = useCallback(
    async (userId: number) => {
      setIsDetailLoading(true);
      notifyError(null);

      const result = await getUserDetail(userId);

      setIsDetailLoading(false);

      if (!result.ok) {
        setDetail(null);
        resolveErrorMessage(result, '회원 상세 정보를 불러오지 못했습니다.');
        return null;
      }

      const nextDetail = result.data ?? null;
      setDetail(nextDetail);
      return nextDetail;
    },
    [notifyError, resolveErrorMessage],
  );

  const syncMutationDetail = useCallback(
    (nextDetail: UserDetail | null) => {
      if (!nextDetail) return;

      setSelectedUserId(nextDetail.userId);
      setDetail(nextDetail);
      setActiveUser({
        userId: nextDetail.userId,
        email: nextDetail.email,
        nickname: nextDetail.nickname,
        role: nextDetail.role,
        status: nextDetail.status,
        authProvider: nextDetail.authProvider,
        loginId: nextDetail.loginId,
        lastLoginAt: nextDetail.lastLoginAt,
        createdAt: nextDetail.createdAt,
      });
    },
    [],
  );

  useEffect(() => {
    loadPage(page, appliedFilters);
  }, [appliedFilters, loadPage, page]);

  useEffect(() => {
    if (!activeUser) return;
    const matched = pageResponse.items.find((item) => item.userId === activeUser.userId);
    if (matched) {
      setActiveUser(matched);
    }
  }, [activeUser, pageResponse.items]);

  const refreshPage = useCallback(async () => {
    await loadPage(page, appliedFilters);
  }, [appliedFilters, loadPage, page]);

  const handleSearch = useCallback(() => {
    setPage(1);
    setAppliedFilters({
      ...filters,
      keyword: filters.keyword.trim(),
    });
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    const next = createDefaultUserSearchForm();
    setFilters(next);
    setAppliedFilters(next);
    setPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refreshPage();
    if (selectedUserId != null && isDetailDialogOpen) {
      await loadDetail(selectedUserId);
    }
  }, [isDetailDialogOpen, loadDetail, refreshPage, selectedUserId]);

  const handleOpenDetail = useCallback(
    async (user: UserListItem) => {
      setSelectedUserId(user.userId);
      setActiveUser(user);
      setIsDetailDialogOpen(true);
      await loadDetail(user.userId);
    },
    [loadDetail],
  );

  const openActionDialog = useCallback(
    async (user: UserListItem, setOpen: (open: boolean) => void) => {
      setSelectedUserId(user.userId);
      setActiveUser(user);
      const nextDetail = await loadDetail(user.userId);
      if (nextDetail) {
        setOpen(true);
      }
    },
    [loadDetail],
  );

  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleOpenUpdateDialog = useCallback(async (user: UserListItem) => {
    await openActionDialog(user, setIsUpdateDialogOpen);
  }, [openActionDialog]);

  const handleOpenStatusDialog = useCallback(async (user: UserListItem) => {
    await openActionDialog(user, setIsStatusDialogOpen);
  }, [openActionDialog]);

  const handleOpenPasswordDialog = useCallback(async (user: UserListItem) => {
    await openActionDialog(user, setIsPasswordDialogOpen);
  }, [openActionDialog]);

  const handleOpenDeleteDialog = useCallback((user: UserListItem) => {
    setSelectedUserId(user.userId);
    setActiveUser(user);
    setDeleteTarget(user);
  }, []);

  const runMutation = useCallback(
    async (
      action: () => Promise<AdminApiResult<UserDetail | null>>,
      successMessage: string,
      fallbackMessage: string,
    ) => {
      if (isMutating) return false;

      setIsMutating(true);
      notifyError(null);
      const result = await action();
      setIsMutating(false);

      if (!result.ok) {
        resolveErrorMessage(result, fallbackMessage);
        return false;
      }

      syncMutationDetail(result.data ?? null);
      notifySuccess(successMessage);
      await refreshPage();
      if (selectedUserId != null && isDetailDialogOpen) {
        await loadDetail(selectedUserId);
      }
      return true;
    },
    [
      isDetailDialogOpen,
      isMutating,
      loadDetail,
      notifyError,
      notifySuccess,
      refreshPage,
      resolveErrorMessage,
      selectedUserId,
      syncMutationDetail,
    ],
  );

  const handleCreateUser = useCallback(
    async (request: CreateLocalUserRequest) => {
      const ok = await runMutation(
        () => createLocalUser(request),
        'LOCAL 회원이 등록되었습니다.',
        '회원 등록에 실패했습니다.',
      );
      if (ok) {
        setIsCreateDialogOpen(false);
      }
      return ok;
    },
    [runMutation],
  );

  const handleUpdateUser = useCallback(
    async (request: UpdateUserRequest) => {
      if (selectedUserId == null) return false;
      const ok = await runMutation(
        () => updateUser(selectedUserId, request),
        '회원 정보가 수정되었습니다.',
        '회원 정보 수정에 실패했습니다.',
      );
      if (ok) {
        setIsUpdateDialogOpen(false);
      }
      return ok;
    },
    [runMutation, selectedUserId],
  );

  const handleUpdateStatus = useCallback(
    async (request: UpdateUserStatusRequest) => {
      if (selectedUserId == null) return false;
      const ok = await runMutation(
        () => updateUserStatus(selectedUserId, request),
        '회원 상태가 변경되었습니다.',
        '회원 상태 변경에 실패했습니다.',
      );
      if (ok) {
        setIsStatusDialogOpen(false);
      }
      return ok;
    },
    [runMutation, selectedUserId],
  );

  const handleResetPassword = useCallback(
    async (request: ResetUserPasswordRequest) => {
      if (selectedUserId == null) return false;
      const ok = await runMutation(
        () => resetUserPassword(selectedUserId, request) as Promise<AdminApiResult<UserDetail | null>>,
        '비밀번호가 재설정되었습니다.',
        '비밀번호 재설정에 실패했습니다.',
      );
      if (ok) {
        setIsPasswordDialogOpen(false);
      }
      return ok;
    },
    [runMutation, selectedUserId],
  );

  const handleDeleteUser = useCallback(async () => {
    if (!deleteTarget) return false;
    const ok = await runMutation(
      () => deleteUser(deleteTarget.userId) as Promise<AdminApiResult<UserDetail | null>>,
      '회원이 삭제되었습니다.',
      '회원 삭제에 실패했습니다.',
    );
    if (ok) {
      setDeleteTarget(null);
      if (selectedUserId === deleteTarget.userId) {
        setSelectedUserId(null);
        setDetail(null);
        setActiveUser(null);
        setIsDetailDialogOpen(false);
      }
    }
    return ok;
  }, [deleteTarget, runMutation, selectedUserId]);

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
    page,
    setPage,
    pageResponse,
    isListLoading,
    currentUserId,
    selectedUserId,
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
  };
};
