import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAdminCode,
  createAdminGroup,
  fetchAdminCodeList,
  fetchAdminGroupList,
  updateAdminCode,
  updateAdminGroup,
} from '@admin/features/commonCode/api/commonCodeApi';
import { AdminApiError, assertOk } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type { StatusFilter } from '@admin/types/comCd';

type MutationMode = 'create' | 'edit';

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
  extraInfo1?: string;
  extraInfo2?: string;
  isActive: boolean;
};

type Options = {
  groupStatus: StatusFilter;
  selectedGroupId: string;
  codeStatus: StatusFilter;
  onGroupSuccess?: (mode: MutationMode) => void;
  onCodeSuccess?: (mode: MutationMode) => void;
  onError?: (err: AdminApiError) => void;
};

const useAdminComCdPage = ({
  groupStatus,
  selectedGroupId,
  codeStatus,
  onGroupSuccess,
  onCodeSuccess,
  onError,
}: Options) => {
  const queryClient = useQueryClient();

  const groupsQuery = useQuery({
    queryKey: adminKeys.comCd.groups(groupStatus),
    queryFn: () => fetchAdminGroupList(groupStatus).then(assertOk),
    staleTime: 0,
  });

  const codesQuery = useQuery({
    queryKey: adminKeys.comCd.codes(selectedGroupId, codeStatus),
    queryFn: () => fetchAdminCodeList(selectedGroupId, codeStatus).then(assertOk),
    enabled: !!selectedGroupId,
    staleTime: 0,
  });

  const createGroupMutation = useMutation({
    mutationFn: async (payload: GroupSubmitPayload) => {
      const result = await createAdminGroup(payload);
      return assertOk(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.comCd.all() });
      onGroupSuccess?.('create');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  const updateGroupMutation = useMutation({
    mutationFn: async ({ groupId, groupName, isActive }: GroupSubmitPayload) => {
      const result = await updateAdminGroup(groupId, { groupName, isActive });
      return assertOk(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.comCd.all() });
      onGroupSuccess?.('edit');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  const createCodeMutation = useMutation({
    mutationFn: async ({ groupId, codeId, codeName, sortSeq, extraInfo1, extraInfo2, isActive }: CodeSubmitPayload) => {
      const result = await createAdminCode(groupId, { codeId, codeName, sortSeq, extraInfo1, extraInfo2, isActive });
      return assertOk(result);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.comCd.codes(variables.groupId, codeStatus) });
      onCodeSuccess?.('create');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  const updateCodeMutation = useMutation({
    mutationFn: async ({ groupId, codeId, codeName, sortSeq, extraInfo1, extraInfo2, isActive }: CodeSubmitPayload) => {
      const result = await updateAdminCode(groupId, codeId, { codeName, sortSeq, extraInfo1, extraInfo2, isActive });
      return assertOk(result);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.comCd.codes(variables.groupId, codeStatus) });
      onCodeSuccess?.('edit');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  return {
    groupsQuery,
    codesQuery,
    createGroupMutation,
    updateGroupMutation,
    createCodeMutation,
    updateCodeMutation,
  };
};

export default useAdminComCdPage;
