import { useCallback, useEffect, useState } from 'react';
import {
  getAiPromptTemplateList,
  getAiPromptTemplateDetail,
  createAiPromptTemplate,
  updateAiPromptTemplate,
  addTemplateRelation,
  deleteTemplateRelation,
  previewTemplate,
} from '@admin/lib/aiTemplateApi';
import type {
  AiPromptTemplateListItem,
  AiPromptTemplateDetail,
  AiPromptTemplateCreateRequest,
} from '@admin/types/aiTemplate';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';
import type { TemplateForm, RelForm } from '../types/forms';
import { initialTemplateForm, initialRelForm } from '../constants/formDefaults';

type UseTemplatePageStateOptions = {
  handleApiError: (status: number, fallback: string) => void;
  setAlertMessage: (msg: string | null) => void;
  setErrorMessage: (msg: string | null) => void;
  loadComCodes: (groupId: string, status?: StatusFilter) => Promise<CommonCode[]>;
};

export const useTemplatePageState = ({
  handleApiError,
  setAlertMessage,
  setErrorMessage,
  loadComCodes,
}: UseTemplatePageStateOptions) => {
  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [templates, setTemplates] = useState<AiPromptTemplateListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AiPromptTemplateDetail | null>(null);

  const [domainCodes, setDomainCodes] = useState<CommonCode[]>([]);
  const [fragmentOptions, setFragmentOptions] = useState<AiPromptTemplateListItem[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<AiPromptTemplateListItem | null>(null);
  const [form, setForm] = useState<TemplateForm>(initialTemplateForm);

  const [isRelOpen, setIsRelOpen] = useState(false);
  const [relForm, setRelForm] = useState<RelForm>(initialRelForm);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewVars, setPreviewVars] = useState('{}');
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [confirmDeleteRelId, setConfirmDeleteRelId] = useState<number | null>(null);

  useEffect(() => {
    loadComCodes('aitp_domain').then(setDomainCodes);
    getAiPromptTemplateList('ACTIVE', 'FRAGMENT').then((r) => {
      if (r.ok) setFragmentOptions(r.data ?? []);
    });
  }, [loadComCodes]);

  const loadTemplates = useCallback(
    async (s: StatusFilter, t: string, d: string) => {
      const result = await getAiPromptTemplateList(s, t === 'ALL' ? undefined : t, d || undefined);
      if (!result.ok) {
        handleApiError(result.status, '템플릿 목록을 불러오지 못했습니다.');
        return;
      }
      setTemplates(result.data ?? []);
    },
    [handleApiError],
  );

  const loadDetail = useCallback(
    async (id: number) => {
      const result = await getAiPromptTemplateDetail(id);
      if (!result.ok) {
        handleApiError(result.status, '템플릿 상세를 불러오지 못했습니다.');
        return;
      }
      setDetail(result.data);
    },
    [handleApiError],
  );

  useEffect(() => {
    setErrorMessage(null);
    setSelectedId(null);
    setDetail(null);
    loadTemplates(status, typeFilter, domainFilter);
  }, [status, typeFilter, domainFilter, loadTemplates, setErrorMessage]);

  useEffect(() => {
    if (selectedId != null) loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

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
      setErrorMessage('템플릿명, 도메인 유형, 내용은 필수입니다.');
      return;
    }
    setErrorMessage(null);

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

    setAlertMessage(editingTemplate == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsFormOpen(false);
    await loadTemplates(status, typeFilter, domainFilter);
    if (selectedId != null) await loadDetail(selectedId);
    getAiPromptTemplateList('ACTIVE', 'FRAGMENT').then((r) => {
      if (r.ok) setFragmentOptions(r.data ?? []);
    });
  };

  const handleAddRelation = async () => {
    if (relForm.childTemplateId === '' || selectedId == null) {
      setErrorMessage('Fragment 템플릿을 선택하세요.');
      return;
    }
    setErrorMessage(null);

    const result = await addTemplateRelation(selectedId, {
      childTemplateId: Number(relForm.childTemplateId),
      mergeType: relForm.mergeType,
      sortSeq: relForm.sortSeq !== '' ? Number(relForm.sortSeq) : undefined,
    });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? 'Fragment 추가에 실패했습니다.');
      return;
    }

    setAlertMessage('Fragment가 추가되었습니다.');
    setIsRelOpen(false);
    setRelForm(initialRelForm);
    await loadDetail(selectedId);
  };

  const handleDeleteRelation = async (relId: number) => {
    if (selectedId == null) return;
    const result = await deleteTemplateRelation(selectedId, relId);
    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? 'Fragment 삭제에 실패했습니다.');
      return;
    }
    setAlertMessage('Fragment 연결이 삭제되었습니다.');
    setConfirmDeleteRelId(null);
    await loadDetail(selectedId);
  };

  const handlePreview = async () => {
    if (selectedId == null) return;
    setPreviewError(null);
    setPreviewResult(null);

    let variables: Record<string, string> = {};
    try {
      variables = JSON.parse(previewVars);
    } catch {
      setPreviewError('변수 JSON 형식이 올바르지 않습니다.');
      return;
    }

    const result = await previewTemplate(selectedId, { variables });
    if (!result.ok) {
      setPreviewError(result.errorMessage ?? '미리보기에 실패했습니다.');
      return;
    }
    setPreviewResult(result.data?.renderedContent ?? '');
  };

  return {
    status,
    setStatus,
    typeFilter,
    setTypeFilter,
    domainFilter,
    setDomainFilter,
    templates,
    loadTemplates,
    selectedId,
    setSelectedId,
    detail,
    domainCodes,
    fragmentOptions,
    isFormOpen,
    setIsFormOpen,
    editingTemplate,
    form,
    setForm,
    isRelOpen,
    setIsRelOpen,
    relForm,
    setRelForm,
    isPreviewOpen,
    setIsPreviewOpen,
    previewVars,
    setPreviewVars,
    previewResult,
    previewError,
    confirmDeleteRelId,
    setConfirmDeleteRelId,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
    handleAddRelation,
    handleDeleteRelation,
    handlePreview,
  };
};
