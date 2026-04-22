import { useCallback } from 'react';
import { useTemplateListState } from './useTemplateListState';
import { useTemplateFormState } from './useTemplateFormState';
import { useTemplateRelationState } from './useTemplateRelationState';
import { adminKeys } from '@admin/lib/queryKeys';
import { useQueryClient } from '@tanstack/react-query';

export const useTemplatePageState = () => {
  const queryClient = useQueryClient();
  const { filters, list } = useTemplateListState();

  const refreshAfterSave = useCallback(async () => {
    await list.loadTemplates();
    await list.loadFragmentOptions();
  }, [list.loadTemplates, list.loadFragmentOptions]);

  const { formDialog } = useTemplateFormState({
    refreshAfterSave: async (editingId) => {
      await refreshAfterSave();
      if (editingId != null) {
        await queryClient.invalidateQueries({ queryKey: adminKeys.ai.template.detail(editingId) });
      }
    },
  });

  const { relationDialog } = useTemplateRelationState({
    parentTemplateId: formDialog.editingTemplate?.templateId ?? null,
    refreshAfterSave: async (parentTemplateId) => {
      await refreshAfterSave();
      await formDialog.loadTemplateDetail(parentTemplateId);
    },
  });

  const setFormOpen = useCallback(
    (open: boolean) => {
      formDialog.setIsFormOpen(open);
      if (!open) relationDialog.setIsRelOpen(false);
    },
    [formDialog.setIsFormOpen, relationDialog.setIsRelOpen],
  );

  return {
    filters,
    list,
    formDialog,
    relationDialog,
    setFormOpen,
  };
};
