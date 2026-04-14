import { useCallback } from 'react';
import { useTemplateListState } from './useTemplateListState';
import { useTemplateFormState } from './useTemplateFormState';
import { useTemplateRelationState } from './useTemplateRelationState';
import { useTemplatePreviewState } from './useTemplatePreviewState';

export const useTemplatePageState = () => {
  const { filters, list } = useTemplateListState();

  const refreshAfterSave = useCallback(async () => {
    await list.loadTemplates(filters.status, filters.typeFilter, filters.domainFilter);
    if (list.selectedId != null) await list.loadDetail(list.selectedId);
    await list.loadFragmentOptions();
  }, [
    list.loadTemplates,
    list.loadDetail,
    list.loadFragmentOptions,
    list.selectedId,
    filters.status,
    filters.typeFilter,
    filters.domainFilter,
  ]);

  const { formDialog } = useTemplateFormState({
    detail: list.detail,
    refreshAfterSave,
  });

  const { relationDialog } = useTemplateRelationState({
    selectedId: list.selectedId,
    refreshAfterSave,
  });

  const { previewDialog } = useTemplatePreviewState({
    selectedId: list.selectedId,
  });

  return {
    filters,
    list,
    formDialog,
    relationDialog,
    previewDialog,
  };
};
