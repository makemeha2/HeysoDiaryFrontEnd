import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  addTemplateRelation,
  deleteTemplateRelation,
} from '../api/aiTemplateApi';
import { assertOk, AdminApiError } from '@admin/lib/queryClientHelpers';
import type { RelForm } from '../types/forms';
import { initialRelForm } from '../constants/formDefaults';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

type UseTemplateRelationStateOptions = {
  parentTemplateId: number | null;
  refreshAfterSave: (parentTemplateId: number) => Promise<void>;
};

export const useTemplateRelationState = ({
  parentTemplateId,
  refreshAfterSave,
}: UseTemplateRelationStateOptions) => {
  const { handleApiError, notifySuccess, notifyError } = useAdminPageContext();

  const [isRelOpen, setIsRelOpen] = useState(false);
  const [relForm, setRelForm] = useState<RelForm>(initialRelForm);
  const [confirmDeleteRelId, setConfirmDeleteRelId] = useState<number | null>(null);

  const addMutation = useMutation({
    mutationFn: (vars: { parentId: number; childTemplateId: number; mergeType: string; sortSeq?: number }) =>
      addTemplateRelation(vars.parentId, {
        childTemplateId: vars.childTemplateId,
        mergeType: vars.mergeType,
        sortSeq: vars.sortSeq,
      }).then(assertOk),
    onSuccess: async (_, vars) => {
      notifySuccess('Fragment가 추가되었습니다.');
      setIsRelOpen(false);
      setRelForm(initialRelForm);
      await refreshAfterSave(vars.parentId);
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (vars: { parentId: number; relId: number }) =>
      deleteTemplateRelation(vars.parentId, vars.relId).then(assertOk),
    onSuccess: async (_, vars) => {
      notifySuccess('Fragment 연결이 삭제되었습니다.');
      setConfirmDeleteRelId(null);
      await refreshAfterSave(vars.parentId);
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
    },
  });

  const handleAddRelation = async () => {
    if (relForm.childTemplateId === '' || parentTemplateId == null) {
      notifyError('Fragment 템플릿을 선택하세요.');
      return;
    }
    notifyError(null);
    await addMutation.mutateAsync({
      parentId: parentTemplateId,
      childTemplateId: Number(relForm.childTemplateId),
      mergeType: relForm.mergeType,
      sortSeq: relForm.sortSeq !== '' ? Number(relForm.sortSeq) : undefined,
    });
  };

  const handleDeleteRelation = async (relId: number) => {
    if (parentTemplateId == null) return;
    await deleteMutation.mutateAsync({ parentId: parentTemplateId, relId });
  };

  return {
    relationDialog: {
      isRelOpen,
      setIsRelOpen,
      relForm,
      setRelForm,
      confirmDeleteRelId,
      setConfirmDeleteRelId,
      handleAddRelation,
      handleDeleteRelation,
      isAdding: addMutation.isPending,
      isDeleting: deleteMutation.isPending,
    },
  };
};
