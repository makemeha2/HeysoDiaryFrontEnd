import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAdminCode, updateAdminCode } from '@admin/lib/comCdApi';
import { AdminApiError, assertOk } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type { StatusFilter } from '@admin/types/comCd';

type CreatePayload = {
  groupId: string;
  codeId: string;
  codeName: string;
  sortSeq: number;
  extraInfo1?: string;
  extraInfo2?: string;
  isActive: boolean;
};

type UpdatePayload = CreatePayload;

type Options = {
  codeStatus: StatusFilter;
  onSuccess?: (mode: 'create' | 'edit') => void;
  onError?: (err: AdminApiError) => void;
};

const useCodeMutations = ({ codeStatus, onSuccess, onError }: Options) => {
  const queryClient = useQueryClient();

  const invalidateCodes = (groupId: string) =>
    queryClient.invalidateQueries({ queryKey: adminKeys.comCd.codes(groupId, codeStatus) });

  const createMutation = useMutation({
    mutationFn: async ({ groupId, codeId, codeName, sortSeq, extraInfo1, extraInfo2, isActive }: CreatePayload) => {
      const result = await createAdminCode(groupId, { codeId, codeName, sortSeq, extraInfo1, extraInfo2, isActive });
      return assertOk(result);
    },
    onSuccess: (_data, variables) => {
      invalidateCodes(variables.groupId);
      onSuccess?.('create');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ groupId, codeId, codeName, sortSeq, extraInfo1, extraInfo2, isActive }: UpdatePayload) => {
      const result = await updateAdminCode(groupId, codeId, { codeName, sortSeq, extraInfo1, extraInfo2, isActive });
      return assertOk(result);
    },
    onSuccess: (_data, variables) => {
      invalidateCodes(variables.groupId);
      onSuccess?.('edit');
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) onError?.(err);
    },
  });

  return { createMutation, updateMutation };
};

export default useCodeMutations;
