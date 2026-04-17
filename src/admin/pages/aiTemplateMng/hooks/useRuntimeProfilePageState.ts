import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getAiRuntimeProfileList,
  createAiRuntimeProfile,
  updateAiRuntimeProfile,
} from '../api/aiTemplateApi';
import type { AiRuntimeProfile, AiRuntimeProfileCreateRequest } from '@admin/types/aiTemplate';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';
import type { ProfileForm } from '../types/forms';
import { initialProfileForm } from '../constants/formDefaults';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

export const useRuntimeProfilePageState = () => {
  const { handleApiError, notifySuccess, notifyError, loadComCodes } = useAdminPageContext();

  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [profiles, setProfiles] = useState<AiRuntimeProfile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AiRuntimeProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(initialProfileForm);

  const [domainCodes, setDomainCodes] = useState<CommonCode[]>([]);
  const [aiModelCodes, setAiModelCodes] = useState<CommonCode[]>([]);

  useEffect(() => {
    loadComCodes('aitp_domain').then(setDomainCodes);
    loadComCodes('ai_models').then(setAiModelCodes);
  }, [loadComCodes]);

  const providerOptions = useMemo(
    () => [...new Set(aiModelCodes.map((c) => c.extraInfo1).filter((v): v is string => !!v))],
    [aiModelCodes],
  );

  const modelOptions = useMemo(
    () => (form.provider ? aiModelCodes.filter((c) => c.extraInfo1 === form.provider) : aiModelCodes),
    [aiModelCodes, form.provider],
  );

  const loadProfiles = useCallback(
    async (s: StatusFilter, d: string) => {
      const result = await getAiRuntimeProfileList(s, d || undefined);
      if (!result.ok) {
        handleApiError(result.status, '런타임 프로파일 목록을 불러오지 못했습니다.');
        return;
      }
      setProfiles(result.data ?? []);
    },
    [handleApiError],
  );

  useEffect(() => {
    notifyError(null);
    loadProfiles(status, domainFilter);
  }, [status, domainFilter, loadProfiles, notifyError]);

  const handleOpenCreate = () => {
    setEditingProfile(null);
    setForm(initialProfileForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = useCallback((profile: AiRuntimeProfile) => {
    setEditingProfile(profile);
    setForm({
      profileKey: profile.profileKey,
      profileName: profile.profileName,
      domainType: profile.domainType,
      provider: profile.provider ?? '',
      model: profile.model,
      // modelName: UI 표시용 필드 (저장하지 않음)
      modelName: profile.modelName,
      temperature: profile.temperature != null ? String(profile.temperature) : '',
      topP: profile.topP != null ? String(profile.topP) : '',
      maxTokens: profile.maxTokens != null ? String(profile.maxTokens) : '',
      description: profile.description ?? '',
      isActive: profile.isActive,
    });
    setIsDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.profileName.trim() || !form.model.trim() || !form.domainType.trim()) {
      notifyError('프로파일명, 도메인 유형, 모델은 필수입니다.');
      return;
    }
    notifyError(null);

    const payload: AiRuntimeProfileCreateRequest = {
      profileKey: form.profileKey.trim(),
      profileName: form.profileName.trim(),
      domainType: form.domainType.trim(),
      model: form.model.trim(),
      provider: form.provider.trim() || undefined,
      temperature: form.temperature !== '' ? Number(form.temperature) : null,
      topP: form.topP !== '' ? Number(form.topP) : null,
      maxTokens: form.maxTokens !== '' ? Number(form.maxTokens) : null,
      description: form.description.trim() || undefined,
      // modelName: UI 표시용 필드 (저장하지 않음)
    };

    const result =
      editingProfile == null
        ? await createAiRuntimeProfile(payload)
        : await updateAiRuntimeProfile(editingProfile.runtimeProfileId, {
            profileName: payload.profileName,
            domainType: payload.domainType,
            model: payload.model,
            provider: payload.provider,
            temperature: payload.temperature,
            topP: payload.topP,
            maxTokens: payload.maxTokens,
            description: payload.description,
            isActive: form.isActive,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '저장에 실패했습니다.');
      return;
    }

    notifySuccess(editingProfile == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsDialogOpen(false);
    await loadProfiles(status, domainFilter);
  };

  return {
    status,
    setStatus,
    domainFilter,
    setDomainFilter,
    profiles,
    loadProfiles,
    isDialogOpen,
    setIsDialogOpen,
    editingProfile,
    form,
    setForm,
    domainCodes,
    providerOptions,
    modelOptions,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
  };
};
