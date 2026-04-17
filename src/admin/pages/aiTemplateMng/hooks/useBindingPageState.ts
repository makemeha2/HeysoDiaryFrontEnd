import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAiPromptBindingList,
  getAiPromptBindingDetail,
  createAiPromptBinding,
  updateAiPromptBinding,
  getAiPromptTemplateList,
  getAiRuntimeProfileList,
} from '../api/aiTemplateApi';
import type {
  AiPromptBindingListItem,
  AiPromptBindingDetail,
  AiPromptBindingCreateRequest,
  AiPromptTemplateListItem,
  AiRuntimeProfile,
} from '@admin/types/aiTemplate';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';
import type { BindingForm } from '../types/forms';
import { initialBindingForm } from '../constants/formDefaults';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

export const useBindingPageState = () => {
  const { handleApiError, notifySuccess, notifyError, loadComCodes } = useAdminPageContext();

  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [bindings, setBindings] = useState<AiPromptBindingListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AiPromptBindingDetail | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBinding, setEditingBinding] = useState<AiPromptBindingListItem | null>(null);
  const [form, setForm] = useState<BindingForm>(initialBindingForm);

  const [allTemplates, setAllTemplates] = useState<AiPromptTemplateListItem[]>([]);
  const [allProfiles, setAllProfiles] = useState<AiRuntimeProfile[]>([]);
  const [domainCodes, setDomainCodes] = useState<CommonCode[]>([]);

  useEffect(() => {
    getAiPromptTemplateList('ALL').then((r) => { if (r.ok) setAllTemplates(r.data ?? []); });
    getAiRuntimeProfileList('ALL').then((r) => { if (r.ok) setAllProfiles(r.data ?? []); });
    loadComCodes('aitp_domain').then(setDomainCodes);
  }, [loadComCodes]);

  const selectedSystemTemplateId = Number(form.systemTemplateId);
  const selectedUserTemplateId = Number(form.userTemplateId);
  const selectedProfileId = Number(form.runtimeProfileId);

  const systemTemplateOptions = useMemo(
    () => allTemplates.filter(
      (t) => t.templateRole === 'SYSTEM' &&
        (t.isActive === 1 || (Number.isFinite(selectedSystemTemplateId) && t.templateId === selectedSystemTemplateId)),
    ),
    [allTemplates, selectedSystemTemplateId],
  );

  const userTemplateOptions = useMemo(
    () => allTemplates.filter(
      (t) => t.templateRole === 'USER' &&
        (t.isActive === 1 || (Number.isFinite(selectedUserTemplateId) && t.templateId === selectedUserTemplateId)),
    ),
    [allTemplates, selectedUserTemplateId],
  );

  const runtimeProfileOptions = useMemo(
    () => allProfiles.filter(
      (p) => p.isActive === 1 || (Number.isFinite(selectedProfileId) && p.runtimeProfileId === selectedProfileId),
    ),
    [allProfiles, selectedProfileId],
  );

  // domainFilter는 서버에서 처리: domainType 파라미터로 전달
  const loadBindings = useCallback(
    async (s: StatusFilter, d: string) => {
      const result = await getAiPromptBindingList(s, d || undefined);
      if (!result.ok) {
        handleApiError(result.status, '바인딩 목록을 불러오지 못했습니다.');
        return;
      }
      setBindings(result.data ?? []);
    },
    [handleApiError],
  );

  const loadDetail = useCallback(
    async (id: number) => {
      const result = await getAiPromptBindingDetail(id);
      if (!result.ok) {
        handleApiError(result.status, '바인딩 상세를 불러오지 못했습니다.');
        return;
      }
      setDetail(result.data ?? null);
    },
    [handleApiError],
  );

  useEffect(() => {
    notifyError(null);
    setSelectedId(null);
    setDetail(null);
    loadBindings(status, domainFilter);
  }, [status, domainFilter, loadBindings, notifyError]);

  useEffect(() => {
    if (selectedId != null) loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

  const handleOpenCreate = () => {
    setEditingBinding(null);
    setForm(initialBindingForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = useCallback((b: AiPromptBindingListItem) => {
    setEditingBinding(b);
    setForm({
      bindingName: b.bindingName,
      domainType: b.domainType,
      featureKey: b.featureKey,
      systemTemplateId: String(b.systemTemplateId),
      userTemplateId: String(b.userTemplateId),
      runtimeProfileId: String(b.runtimeProfileId),
      description: '',
      isActive: b.isActive,
    });
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    if (isFormOpen && editingBinding != null && detail != null && detail.bindingId === editingBinding.bindingId) {
      setForm((prev) => ({ ...prev, description: detail.description ?? '' }));
    }
  }, [isFormOpen, editingBinding, detail]);

  const handleSave = async () => {
    if (
      !form.bindingName.trim() ||
      !form.domainType.trim() ||
      !form.featureKey.trim() ||
      !form.systemTemplateId.trim() ||
      !form.userTemplateId.trim() ||
      !form.runtimeProfileId.trim()
    ) {
      notifyError('바인딩명, 도메인, Feature Key, System/User 템플릿, 런타임 프로파일은 필수입니다.');
      return;
    }
    notifyError(null);

    const payload: AiPromptBindingCreateRequest = {
      bindingName: form.bindingName.trim(),
      domainType: form.domainType.trim(),
      featureKey: form.featureKey.trim(),
      systemTemplateId: Number(form.systemTemplateId),
      userTemplateId: Number(form.userTemplateId),
      runtimeProfileId: Number(form.runtimeProfileId),
      description: form.description.trim() || undefined,
    };

    const result =
      editingBinding == null
        ? await createAiPromptBinding(payload)
        : await updateAiPromptBinding(editingBinding.bindingId, {
            bindingName: payload.bindingName,
            domainType: payload.domainType,
            systemTemplateId: payload.systemTemplateId,
            userTemplateId: payload.userTemplateId,
            runtimeProfileId: payload.runtimeProfileId,
            description: payload.description,
            isActive: form.isActive,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '저장에 실패했습니다.');
      return;
    }

    notifySuccess(editingBinding == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsFormOpen(false);
    await loadBindings(status, domainFilter);
    if (selectedId != null) await loadDetail(selectedId);
  };

  return {
    status,
    setStatus,
    domainFilter,
    setDomainFilter,
    bindings,
    loadBindings,
    selectedId,
    setSelectedId,
    detail,
    isFormOpen,
    setIsFormOpen,
    editingBinding,
    form,
    setForm,
    domainCodes,
    systemTemplateOptions,
    userTemplateOptions,
    runtimeProfileOptions,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
  };
};
