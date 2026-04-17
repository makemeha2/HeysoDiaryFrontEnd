import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAiPromptTemplate,
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
  detail: AiPromptTemplateDetail | null;
  // 하위호환: 외부에서 refreshAfterSave를 전달하면 mutation onSuccess에서 호출
  refreshAfterSave?: () => Promise<void>;
};

export const useTemplateFormState = ({
  detail,
  refreshAfterSave,
}: UseTemplateFormStateOptions) => {
  const queryClient = useQueryClient();
  const { handleApiError, notifySuccess, notifyError } = useAdminPageContext();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AiPromptTemplateListItem | null>(null);
  const [form, setForm] = useState<TemplateForm>(initialTemplateForm);

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setForm(initialTemplateForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = useCallback((t: AiPromptTemplateListItem) => {
    setEditingTemplate(t);
    setForm({
      templateKey: t.templateKey,
      templateName: t.templateName,
      domainType: t.domainType,
      featureKey: t.featureKey ?? '',
      templateRole: t.templateRole,
      templateType: t.templateType,
      content: '',
      description: '',
      isActive: t.isActive,
    });
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    if (
      isFormOpen &&
      editingTemplate != null &&
      detail != null &&
      detail.templateId === editingTemplate.templateId
    ) {
      setForm((prev) => ({
        ...prev,
        content: detail.content ?? '',
        description: detail.description ?? '',
      }));
    }
  }, [isFormOpen, editingTemplate, detail]);

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
        await refreshAfterSave();
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
      form,
      setForm,
      handleOpenCreate,
      handleOpenEdit,
      handleSave,
    },
  };
};
