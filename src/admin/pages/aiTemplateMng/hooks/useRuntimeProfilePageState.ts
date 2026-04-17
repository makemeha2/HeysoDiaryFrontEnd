import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAiRuntimeProfileList,
  createAiRuntimeProfile,
  updateAiRuntimeProfile,
} from '@admin/lib/aiTemplateApi';
import { assertOk, AdminApiError } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import useComCodesQuery from '@admin/features/commonCode/hooks/useComCodesQuery';
import type { AiRuntimeProfile, AiRuntimeProfileCreateRequest } from '@admin/types/aiTemplate';
import type { StatusFilter } from '@admin/types/comCd';
import type { ProfileForm } from '../types/forms';
import { initialProfileForm } from '../constants/formDefaults';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

export const useRuntimeProfilePageState = () => {
  const queryClient = useQueryClient();
  const { handleApiError, notifySuccess, notifyError } = useAdminPageContext();

  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AiRuntimeProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(initialProfileForm);

  const profilesQuery = useQuery({
    queryKey: adminKeys.ai.profile.list({ status, domain: domainFilter }),
    queryFn: () => getAiRuntimeProfileList(status, domainFilter || undefined).then(assertOk),
    staleTime: 0,
  });

  const domainCodesQuery = useComCodesQuery('aitp_domain');
  const aiModelCodesQuery = useComCodesQuery('ai_models');

  const domainCodes = domainCodesQuery.data ?? [];
  const aiModelCodes = aiModelCodesQuery.data ?? [];

  // 필터 변경 시 에러 초기화
  useEffect(() => {
    notifyError(null);
  }, [status, domainFilter, notifyError]);

  // 쿼리 에러 → 컨텍스트 에러 핸들러로 위임
  useEffect(() => {
    const err = profilesQuery.error;
    if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
  }, [profilesQuery.error, handleApiError]);

  const providerOptions = useMemo(
    () => [...new Set(aiModelCodes.map((c) => c.extraInfo1).filter((v): v is string => !!v))],
    [aiModelCodes],
  );

  const modelOptions = useMemo(
    () => (form.provider ? aiModelCodes.filter((c) => c.extraInfo1 === form.provider) : aiModelCodes),
    [aiModelCodes, form.provider],
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: { form: ProfileForm; editingId: number | null }) => {
      const { form: f, editingId } = payload;
      const req: AiRuntimeProfileCreateRequest = {
        profileKey: f.profileKey.trim(),
        profileName: f.profileName.trim(),
        domainType: f.domainType.trim(),
        model: f.model.trim(),
        provider: f.provider.trim() || undefined,
        temperature: f.temperature !== '' ? Number(f.temperature) : null,
        topP: f.topP !== '' ? Number(f.topP) : null,
        maxTokens: f.maxTokens !== '' ? Number(f.maxTokens) : null,
        description: f.description.trim() || undefined,
      };
      if (editingId == null) {
        return assertOk(await createAiRuntimeProfile(req));
      }
      return assertOk(
        await updateAiRuntimeProfile(editingId, {
          profileName: req.profileName,
          domainType: req.domainType,
          model: req.model,
          provider: req.provider,
          temperature: req.temperature,
          topP: req.topP,
          maxTokens: req.maxTokens,
          description: req.description,
          isActive: f.isActive,
        }),
      );
    },
    onSuccess: async (_data, variables) => {
      notifySuccess(variables.editingId == null ? '등록되었습니다.' : '수정되었습니다.');
      setIsDialogOpen(false);
      await queryClient.invalidateQueries({
        queryKey: adminKeys.ai.profile.list({ status, domain: domainFilter }),
      });
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
    },
  });

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
    await saveMutation.mutateAsync({ form, editingId: editingProfile?.runtimeProfileId ?? null });
  };

  const loadProfiles = useCallback(
    async (_s?: StatusFilter, _d?: string) => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.ai.profile.list({ status, domain: domainFilter }),
      });
    },
    [queryClient, status, domainFilter],
  );

  return {
    status,
    setStatus,
    domainFilter,
    setDomainFilter,
    profiles: profilesQuery.data ?? [],
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
