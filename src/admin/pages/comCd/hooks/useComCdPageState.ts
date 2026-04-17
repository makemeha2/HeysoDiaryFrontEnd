import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdminPageContext } from '@admin/context/AdminPageContext';
import { AdminApiError } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type { CommonCode, CommonCodeGroup, StatusFilter } from '@admin/types/comCd';
import useAdminComCdPage from './useAdminComCdPage';

type GroupSubmitPayload = {
  groupId: string;
  groupName: string;
  isActive: boolean;
};

type CodeSubmitPayload = {
  groupId: string;
  codeId: string;
  codeName: string;
  sortSeq: number;
  extraInfo1: string;
  extraInfo2: string;
  isActive: boolean;
};

export const useComCdPageState = () => {
  const queryClient = useQueryClient();
  const { handleApiError, notifyError, notifySuccess } = useAdminPageContext();

  const [groupStatus, setGroupStatus] = useState<StatusFilter>('ACTIVE');
  const [codeStatus, setCodeStatus] = useState<StatusFilter>('ACTIVE');
  const [showEditedAt, setShowEditedAt] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedCodeId, setSelectedCodeId] = useState('');

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CommonCodeGroup | null>(null);
  const [editingCode, setEditingCode] = useState<CommonCode | null>(null);

  const preferredGroupIdRef = useRef('');
  const preferredCodeIdRef = useRef('');

  const {
    groupsQuery,
    codesQuery,
    createGroupMutation,
    updateGroupMutation,
    createCodeMutation,
    updateCodeMutation,
  } = useAdminComCdPage({
    groupStatus,
    selectedGroupId,
    codeStatus,
    onGroupSuccess: (mode) => {
      notifySuccess(mode === 'create' ? '등록되었습니다.' : '수정되었습니다.');
      setIsGroupDialogOpen(false);
    },
    onCodeSuccess: (mode) => {
      notifySuccess(mode === 'create' ? '등록되었습니다.' : '수정되었습니다.');
      setIsCodeDialogOpen(false);
    },
    onError: (err) => handleApiError(err.status, err.errorMessage),
  });

  const groups = groupsQuery.data ?? [];
  const codes = codesQuery.data ?? [];

  useEffect(() => {
    const err = groupsQuery.error ?? codesQuery.error;
    if (err instanceof AdminApiError) {
      handleApiError(err.status, err.errorMessage);
    }
  }, [codesQuery.error, groupsQuery.error, handleApiError]);

  useEffect(() => {
    const data = groupsQuery.data ?? [];
    if (!data.length) {
      setSelectedGroupId('');
      return;
    }

    const preferred = preferredGroupIdRef.current;
    const hasPreferred = !!preferred && data.some((group) => group.groupId === preferred);
    const hasCurrent = !!selectedGroupId && data.some((group) => group.groupId === selectedGroupId);
    const firstActive = data.find((group) => group.isActive)?.groupId;

    if (hasPreferred) {
      setSelectedGroupId(preferred);
    } else if (!hasCurrent) {
      setSelectedGroupId(firstActive ?? data[0]?.groupId ?? '');
    }

    preferredGroupIdRef.current = '';
  }, [groupsQuery.data, selectedGroupId]);

  useEffect(() => {
    const data = codesQuery.data ?? [];
    if (!data.length) {
      setSelectedCodeId('');
      return;
    }

    const preferred = preferredCodeIdRef.current;
    const hasPreferred = !!preferred && data.some((code) => code.codeId === preferred);
    const hasCurrent = !!selectedCodeId && data.some((code) => code.codeId === selectedCodeId);

    if (hasPreferred) {
      setSelectedCodeId(preferred);
    } else if (!hasCurrent) {
      setSelectedCodeId(data[0]?.codeId ?? '');
    }

    preferredCodeIdRef.current = '';
  }, [codesQuery.data, selectedCodeId]);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.groupId === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const handleRefreshGroups = useCallback(async () => {
    notifyError(null);
    await queryClient.invalidateQueries({ queryKey: adminKeys.comCd.groups(groupStatus) });
  }, [groupStatus, notifyError, queryClient]);

  const handleRefreshCodes = useCallback(async () => {
    if (!selectedGroupId) {
      notifyError('먼저 그룹을 선택하세요.');
      return;
    }

    notifyError(null);
    await queryClient.invalidateQueries({
      queryKey: adminKeys.comCd.codes(selectedGroupId, codeStatus),
    });
  }, [codeStatus, notifyError, queryClient, selectedGroupId]);

  const handleOpenCreateGroupDialog = useCallback(() => {
    setEditingGroup(null);
    setIsGroupDialogOpen(true);
  }, []);

  const handleOpenEditGroupDialog = useCallback((group: CommonCodeGroup) => {
    setSelectedGroupId(group.groupId);
    setEditingGroup(group);
    setIsGroupDialogOpen(true);
  }, []);

  const handleGroupSubmit = useCallback(
    async (payload: GroupSubmitPayload, mode: 'create' | 'edit') => {
      notifyError(null);
      preferredGroupIdRef.current = payload.groupId;

      if (mode === 'create') {
        await createGroupMutation.mutateAsync(payload);
        return;
      }

      await updateGroupMutation.mutateAsync(payload);
    },
    [createGroupMutation, notifyError, updateGroupMutation],
  );

  const handleOpenCreateCodeDialog = useCallback(() => {
    if (!selectedGroupId) {
      notifyError('먼저 그룹을 선택하세요.');
      return;
    }

    setEditingCode(null);
    setIsCodeDialogOpen(true);
  }, [notifyError, selectedGroupId]);

  const handleOpenEditCodeDialog = useCallback((code: CommonCode) => {
    setSelectedGroupId(code.groupId);
    setSelectedCodeId(code.codeId);
    setEditingCode(code);
    setIsCodeDialogOpen(true);
  }, []);

  const handleCodeSubmit = useCallback(
    async (payload: CodeSubmitPayload, mode: 'create' | 'edit') => {
      notifyError(null);
      if (!payload.groupId) {
        notifyError('먼저 그룹을 선택하세요.');
        return;
      }

      preferredCodeIdRef.current = payload.codeId;
      const normalized = {
        ...payload,
        sortSeq: Number(payload.sortSeq),
        extraInfo1: payload.extraInfo1.trim() || undefined,
        extraInfo2: payload.extraInfo2.trim() || undefined,
      };

      if (mode === 'create') {
        await createCodeMutation.mutateAsync(normalized);
        return;
      }

      await updateCodeMutation.mutateAsync(normalized);
    },
    [createCodeMutation, notifyError, updateCodeMutation],
  );

  const isGroupMutating = createGroupMutation.isPending || updateGroupMutation.isPending;
  const isCodeMutating = createCodeMutation.isPending || updateCodeMutation.isPending;

  return {
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
  };
};
