import { useState } from 'react';
import {
  addTemplateRelation,
  deleteTemplateRelation,
} from '@admin/lib/aiTemplateApi';
import type { RelForm } from '../types/forms';
import { initialRelForm } from '../constants/formDefaults';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

type UseTemplateRelationStateOptions = {
  selectedId: number | null;
  refreshAfterSave: () => Promise<void>;
};

export const useTemplateRelationState = ({
  selectedId,
  refreshAfterSave,
}: UseTemplateRelationStateOptions) => {
  const { handleApiError, notifySuccess, notifyError } = useAdminPageContext();

  const [isRelOpen, setIsRelOpen] = useState(false);
  const [relForm, setRelForm] = useState<RelForm>(initialRelForm);
  const [confirmDeleteRelId, setConfirmDeleteRelId] = useState<number | null>(null);

  const handleAddRelation = async () => {
    if (relForm.childTemplateId === '' || selectedId == null) {
      notifyError('Fragment 템플릿을 선택하세요.');
      return;
    }
    notifyError(null);

    const result = await addTemplateRelation(selectedId, {
      childTemplateId: Number(relForm.childTemplateId),
      mergeType: relForm.mergeType,
      sortSeq: relForm.sortSeq !== '' ? Number(relForm.sortSeq) : undefined,
    });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? 'Fragment 추가에 실패했습니다.');
      return;
    }

    notifySuccess('Fragment가 추가되었습니다.');
    setIsRelOpen(false);
    setRelForm(initialRelForm);
    await refreshAfterSave();
  };

  const handleDeleteRelation = async (relId: number) => {
    if (selectedId == null) return;
    const result = await deleteTemplateRelation(selectedId, relId);
    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? 'Fragment 삭제에 실패했습니다.');
      return;
    }
    notifySuccess('Fragment 연결이 삭제되었습니다.');
    setConfirmDeleteRelId(null);
    await refreshAfterSave();
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
    },
  };
};
