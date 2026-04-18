import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { assertOk, AdminApiError } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type {
  CreateLocalUserRequest,
  ResetUserPasswordRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
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
  const queryClient = useQueryClient();
  const { handleApiError, notifyError, notifySuccess } = useAdminPageContext();
  const defaultFilters = useMemo(() => createDefaultUserSearchForm(), []);

  const [filters, setFilters] = useState<UserSearchForm>(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState<UserSearchForm>(defaultFilters);
  const [page, setPage] = useState(1);

  const [currentUserId] = useState<number | null>(() => getAdminUserId());

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [activeUser, setActiveUser] = useState<UserListItem | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UserListItem | null>(null);

  const pageQuery = useQuery({
    queryKey: adminKeys.user.page({ ...appliedFilters, page }),
    queryFn: () =>
      getUserPage({ ...appliedFilters, page, size: USER_PAGE_SIZE }).then(assertOk),
    staleTime: 0,
  });

  const detailQuery = useQuery({
    queryKey: adminKeys.user.detail(selectedUserId!),
    queryFn: () => getUserDetail(selectedUserId!).then(assertOk),
    enabled: selectedUserId != null,
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

  // 페이지 데이터 갱신 시 activeUser 동기화
  const pageResponse = pageQuery.data ?? emptyPageResponse;
  useEffect(() => {
    if (!activeUser) return;
    const matched = pageResponse.items.find((item) => item.userId === activeUser.userId);
    if (matched) setActiveUser(matched);
  }, [activeUser, pageResponse.items]);

  const resolveConflictError = useCallback(
    (err: unknown) => {
      if (!(err instanceof AdminApiError)) return;
      if (err.status === 409 && err.errorCode) {
        const mapped = USER_CONFLICT_MESSAGE_MAP[err.errorCode];
        if (mapped) {
          notifyError(mapped);
          return;
        }
      }
      handleApiError(err.status, err.errorMessage);
    },
    [handleApiError, notifyError],
  );

  const createMutation = useMutation({
    mutationFn: (request: CreateLocalUserRequest) => createLocalUser(request).then(assertOk),
    onSuccess: async () => {
      notifySuccess('LOCAL 회원이 등록되었습니다.');
      setIsCreateDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: adminKeys.user.all() });
    },
    onError: resolveConflictError,
  });

  const updateMutation = useMutation({
    mutationFn: ({ userId, request }: { userId: number; request: UpdateUserRequest }) =>
      updateUser(userId, request).then(assertOk),
    onSuccess: async () => {
      notifySuccess('회원 정보가 수정되었습니다.');
      setIsUpdateDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: adminKeys.user.all() });
    },
    onError: resolveConflictError,
  });

  const statusMutation = useMutation({
    mutationFn: ({ userId, request }: { userId: number; request: UpdateUserStatusRequest }) =>
      updateUserStatus(userId, request).then(assertOk),
    onSuccess: async () => {
      notifySuccess('회원 상태가 변경되었습니다.');
      setIsStatusDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: adminKeys.user.all() });
    },
    onError: resolveConflictError,
  });

  const passwordMutation = useMutation({
    mutationFn: ({ userId, request }: { userId: number; request: ResetUserPasswordRequest }) =>
      resetUserPassword(userId, request).then(assertOk),
    onSuccess: async () => {
      notifySuccess('비밀번호가 재설정되었습니다.');
      setIsPasswordDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: adminKeys.user.all() });
    },
    onError: resolveConflictError,
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: number) => deleteUser(userId).then(assertOk),
    onSuccess: async (_data, deletedUserId) => {
      notifySuccess('회원이 삭제되었습니다.');
      setDeleteTarget(null);
      if (selectedUserId === deletedUserId) {
        setSelectedUserId(null);
        setActiveUser(null);
        setIsDetailDialogOpen(false);
      }
      await queryClient.invalidateQueries({ queryKey: adminKeys.user.all() });
    },
    onError: resolveConflictError,
  });

  const isMutating =
    createMutation.isPending ||
    updateMutation.isPending ||
    statusMutation.isPending ||
    passwordMutation.isPending ||
    deleteMutation.isPending;

  const handleSearch = useCallback(() => {
    setPage(1);
    setAppliedFilters({ ...filters, keyword: filters.keyword.trim() });
  }, [filters]);

  const handleResetFilters = useCallback(() => {
    const next = createDefaultUserSearchForm();
    setFilters(next);
    setAppliedFilters(next);
    setPage(1);
  }, []);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: adminKeys.user.page({ ...appliedFilters, page }),
    });
    if (selectedUserId != null && isDetailDialogOpen) {
      await queryClient.invalidateQueries({ queryKey: adminKeys.user.detail(selectedUserId) });
    }
  }, [queryClient, appliedFilters, page, selectedUserId, isDetailDialogOpen]);

  const handleOpenDetail = useCallback(
    (user: UserListItem) => {
      setSelectedUserId(user.userId);
      setActiveUser(user);
      setIsDetailDialogOpen(true);
      queryClient.invalidateQueries({ queryKey: adminKeys.user.detail(user.userId) });
    },
    [queryClient],
  );

  const openActionDialog = useCallback(
    async (user: UserListItem, setOpen: (open: boolean) => void) => {
      setActiveUser(user);
      try {
        await queryClient.fetchQuery({
          queryKey: adminKeys.user.detail(user.userId),
          queryFn: () => getUserDetail(user.userId).then(assertOk),
          staleTime: 0,
        });
        setSelectedUserId(user.userId);
        setOpen(true);
      } catch (err) {
        if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
      }
    },
    [queryClient, handleApiError],
  );

  const handleOpenCreateDialog = useCallback(() => {
    setIsCreateDialogOpen(true);
  }, []);

  const handleOpenUpdateDialog = useCallback(
    async (user: UserListItem) => {
      await openActionDialog(user, setIsUpdateDialogOpen);
    },
    [openActionDialog],
  );

  const handleOpenStatusDialog = useCallback(
    async (user: UserListItem) => {
      await openActionDialog(user, setIsStatusDialogOpen);
    },
    [openActionDialog],
  );

  const handleOpenPasswordDialog = useCallback(
    async (user: UserListItem) => {
      await openActionDialog(user, setIsPasswordDialogOpen);
    },
    [openActionDialog],
  );

  const handleOpenDeleteDialog = useCallback((user: UserListItem) => {
    setSelectedUserId(user.userId);
    setActiveUser(user);
    setDeleteTarget(user);
  }, []);

  const handleCreateUser = useCallback(
    async (request: CreateLocalUserRequest): Promise<boolean> => {
      try {
        await createMutation.mutateAsync(request);
        return true;
      } catch {
        return false;
      }
    },
    [createMutation],
  );

  const handleUpdateUser = useCallback(
    async (request: UpdateUserRequest): Promise<boolean> => {
      if (selectedUserId == null) return false;
      try {
        await updateMutation.mutateAsync({ userId: selectedUserId, request });
        return true;
      } catch {
        return false;
      }
    },
    [updateMutation, selectedUserId],
  );

  const handleUpdateStatus = useCallback(
    async (request: UpdateUserStatusRequest): Promise<boolean> => {
      if (selectedUserId == null) return false;
      try {
        await statusMutation.mutateAsync({ userId: selectedUserId, request });
        return true;
      } catch {
        return false;
      }
    },
    [statusMutation, selectedUserId],
  );

  const handleResetPassword = useCallback(
    async (request: ResetUserPasswordRequest): Promise<boolean> => {
      if (selectedUserId == null) return false;
      try {
        await passwordMutation.mutateAsync({ userId: selectedUserId, request });
        return true;
      } catch {
        return false;
      }
    },
    [passwordMutation, selectedUserId],
  );

  const handleDeleteUser = useCallback(async (): Promise<boolean> => {
    if (!deleteTarget) return false;
    try {
      await deleteMutation.mutateAsync(deleteTarget.userId);
      return true;
    } catch {
      return false;
    }
  }, [deleteMutation, deleteTarget]);

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
    page,
    setPage,
    pageResponse,
    isListLoading: pageQuery.isFetching,
    currentUserId,
    selectedUserId,
    activeUser,
    detail: detailQuery.data ?? null,
    isDetailLoading: detailQuery.isFetching,
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
