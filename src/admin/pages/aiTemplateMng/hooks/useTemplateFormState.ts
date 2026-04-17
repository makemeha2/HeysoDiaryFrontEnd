import { useCallback, useEffect, useState } from 'react';
import {
  createAiPromptTemplate,
  updateAiPromptTemplate,
} from '../api/aiTemplateApi';
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
  refreshAfterSave: () => Promise<void>;
};

export const useTemplateFormState = ({
  detail,
  refreshAfterSave,
}: UseTemplateFormStateOptions) => {
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
    if (isFormOpen && editingTemplate != null && detail != null && detail.templateId === editingTemplate.templateId) {
      setForm((prev) => ({
        ...prev,
        content: detail.content ?? '',
        description: detail.description ?? '',
      }));
    }
  }, [isFormOpen, editingTemplate, detail]);

  const handleSave = async () => {
    if (!form.templateName.trim() || !form.domainType.trim() || !form.content.trim()) {
      notifyError('템플릿명, 도메인 유형, 내용은 필수입니다.');
      return;
    }
    notifyError(null);

    const payload: AiPromptTemplateCreateRequest = {
      templateKey: form.templateKey.trim(),
      templateName: form.templateName.trim(),
      domainType: form.domainType.trim(),
      featureKey: form.featureKey.trim() || undefined,
      templateRole: form.templateRole,
      templateType: form.templateType,
      content: form.content,
      description: form.description.trim() || undefined,
    };

    const result =
      editingTemplate == null
        ? await createAiPromptTemplate(payload)
        : await updateAiPromptTemplate(editingTemplate.templateId, {
            templateName: payload.templateName,
            domainType: payload.domainType,
            featureKey: payload.featureKey,
            templateRole: payload.templateRole,
            templateType: payload.templateType,
            content: payload.content,
            description: payload.description,
            isActive: form.isActive,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '저장에 실패했습니다.');
      return;
    }

    notifySuccess(editingTemplate == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsFormOpen(false);
    await refreshAfterSave();
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
