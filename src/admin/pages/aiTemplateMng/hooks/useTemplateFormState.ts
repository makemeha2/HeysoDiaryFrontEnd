import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAiPromptTemplate,
  getAiPromptTemplateDetail,
  updateAiPromptTemplate,
} from '../api/aiTemplateApi';
import { assertOk, AdminApiError } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type {
  AiPromptTemplateListItem,
  AiPromptTemplateDetail,
  AiPromptTemplateCreateRequest,
} from '@admin/types/aiTemplate';
import type { TemplateForm } from '../types/forms';
import { initialTemplateForm } from '../constants/formDefaults';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

type UseTemplateFormStateOptions = {
  refreshAfterSave?: (editingId: number | null) => Promise<void>;
};

export const useTemplateFormState = ({
  refreshAfterSave,
}: UseTemplateFormStateOptions) => {
  const queryClient = useQueryClient();
  const { handleApiError, notifySuccess, notifyError } = useAdminPageContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AiPromptTemplateListItem | null>(null);
  const [editingDetail, setEditingDetail] = useState<AiPromptTemplateDetail | null>(null);
  const [form, setForm] = useState<TemplateForm>(initialTemplateForm);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setEditingDetail(null);
    setForm(initialTemplateForm);
    setIsFormOpen(true);
  };

  const loadTemplateDetail = useCallback(
    async (templateId: number) => {
      const templateDetail = await queryClient.fetchQuery({
        queryKey: adminKeys.ai.template.detail(templateId),
        queryFn: () => getAiPromptTemplateDetail(templateId).then(assertOk),
        staleTime: 0,
      });

      setEditingDetail(templateDetail);
      return templateDetail;
    },
    [queryClient],
  );

  const handleOpenEdit = useCallback(
    async (t: AiPromptTemplateListItem) => {
      try {
        const templateDetail = await loadTemplateDetail(t.templateId);

        setEditingTemplate(t);
        setForm({
          templateKey: templateDetail.templateKey,
          templateName: templateDetail.templateName,
          domainType: templateDetail.domainType,
          featureKey: templateDetail.featureKey ?? '',
          templateRole: templateDetail.templateRole,
          templateType: templateDetail.templateType,
          content: templateDetail.content ?? '',
          description: templateDetail.description ?? '',
          isActive: templateDetail.isActive,
        });
        setIsFormOpen(true);
      } catch (err) {
        if (err instanceof AdminApiError) {
          handleApiError(err.status, err.errorMessage);
        }
      }
    },
    [loadTemplateDetail, handleApiError],
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: { form: TemplateForm; editingId: number | null }) => {
      const { form: f, editingId } = payload;
      const req: AiPromptTemplateCreateRequest = {
        templateKey: f.templateKey.trim(),
        templateName: f.templateName.trim(),
        domainType: f.domainType.trim(),
        featureKey: f.featureKey.trim() || undefined,
        templateRole: f.templateRole,
        templateType: f.templateType,
        content: f.content,
        description: f.description.trim() || undefined,
      };
      if (editingId == null) {
        return assertOk(await createAiPromptTemplate(req));
      }
      return assertOk(
        await updateAiPromptTemplate(editingId, {
          templateName: req.templateName,
          domainType: req.domainType,
          featureKey: req.featureKey,
          templateRole: req.templateRole,
          templateType: req.templateType,
          content: req.content,
          description: req.description,
          isActive: f.isActive,
        }),
      );
    },
    onSuccess: async (_data, variables) => {
      notifySuccess(variables.editingId == null ? '등록되었습니다.' : '수정되었습니다.');
      setIsFormOpen(false);
      if (refreshAfterSave) {
        await refreshAfterSave(variables.editingId);
      } else {
        // refreshAfterSave가 없으면 직접 관련 쿼리 무효화
        await queryClient.invalidateQueries({ queryKey: adminKeys.ai.template.list({}) });
        await queryClient.invalidateQueries({ queryKey: adminKeys.ai.template.fragmentOptions() });
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) {
        handleApiError(err.status, err.errorMessage);
      }
    },
  });

  const handleSave = async () => {
    if (!form.templateName.trim() || !form.domainType.trim() || !form.content.trim()) {
      notifyError('템플릿명, 도메인 유형, 내용은 필수입니다.');
      return;
    }
    notifyError(null);
    await saveMutation.mutateAsync({
      form,
      editingId: editingTemplate?.templateId ?? null,
    });
  };

  return {
    formDialog: {
      isFormOpen,
      setIsFormOpen,
      editingTemplate,
      editingDetail,
      form,
      setForm,
      handleOpenCreate,
      handleOpenEdit,
      handleSave,
      loadTemplateDetail,
    },
  };
};
