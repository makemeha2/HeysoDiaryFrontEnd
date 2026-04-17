import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminGroup, updateAdminGroup } from '@admin/lib/comCdApi';
import { AdminApiError, assertOk } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';

type Options = {
  onSuccess?: (mode: 'create' | 'edit') => void;
  onError?: (err: AdminApiError) => void;
};

const useCodeGroupMutations = ({ onSuccess, onError }: Options = {}) => {
  const queryClient = useQueryClient();

  const invalidateGroups = () =>
    queryClient.invalidateQueries({ queryKey: adminKeys.comCd.all() });

  const createMutation = useMutation({
    mutationFn: async (payload: { groupId: string; groupName: string; isActive: boolean }) => {
      const result = await createAdminGroup(payload);
      return assertOk(result);
    },
    onSuccess: () => {
      invalidateGroups();
      onSuccess?.('create');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      groupId,
      groupName,
      isActive,
    }: {
      groupId: string;
      groupName: string;
      isActive: boolean;
    }) => {
      const result = await updateAdminGroup(groupId, { groupName, isActive });
      return assertOk(result);
    },
    onSuccess: () => {
      invalidateGroups();
      onSuccess?.('edit');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  return { createMutation, updateMutation };
};

export default useCodeGroupMutations;
