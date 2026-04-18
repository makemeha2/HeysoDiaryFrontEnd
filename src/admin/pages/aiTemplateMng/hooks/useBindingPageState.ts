import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAiPromptBindingList,
  getAiPromptBindingDetail,
  createAiPromptBinding,
  updateAiPromptBinding,
  getAiPromptTemplateList,
  getAiRuntimeProfileList,
} from '../api/aiTemplateApi';
import { assertOk, AdminApiError } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import useComCodesQuery from '@admin/features/commonCode/hooks/useComCodesQuery';
import type {
  AiPromptBindingListItem,
  AiPromptBindingCreateRequest,
} from '@admin/types/aiTemplate';
import type { StatusFilter } from '@admin/types/comCd';
import type { BindingForm } from '../types/forms';
import { initialBindingForm } from '../constants/formDefaults';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

export const useBindingPageState = () => {
  const queryClient = useQueryClient();
  const { handleApiError, notifySuccess, notifyError } = useAdminPageContext();

  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBinding, setEditingBinding] = useState<AiPromptBindingListItem | null>(null);
  const [form, setForm] = useState<BindingForm>(initialBindingForm);

  const bindingsQuery = useQuery({
    queryKey: adminKeys.ai.binding.list({ status, domain: domainFilter }),
    queryFn: () => getAiPromptBindingList(status, domainFilter || undefined).then(assertOk),
    staleTime: 0,
  });

  const detailQuery = useQuery({
    queryKey: adminKeys.ai.binding.detail(selectedId!),
    queryFn: () => getAiPromptBindingDetail(selectedId!).then(assertOk),
    enabled: selectedId != null,
    staleTime: 0,
  });

  const allTemplatesQuery = useQuery({
    queryKey: adminKeys.ai.template.list({ status: 'ALL' }),
    queryFn: () => getAiPromptTemplateList('ALL').then(assertOk),
    staleTime: 30_000,
  });

  const allProfilesQuery = useQuery({
    queryKey: adminKeys.ai.profile.list({ status: 'ALL' }),
    queryFn: () => getAiRuntimeProfileList('ALL').then(assertOk),
    staleTime: 30_000,
  });

  const domainCodesQuery = useComCodesQuery('aitp_domain');

  const detail = detailQuery.data ?? null;
  const allTemplates = allTemplatesQuery.data ?? [];
  const allProfiles = allProfilesQuery.data ?? [];

  // 필터 변경 시 선택 초기화
  useEffect(() => {
    setSelectedId(null);
    notifyError(null);
  }, [status, domainFilter, notifyError]);

  // 쿼리 에러 → 컨텍스트 에러 핸들러로 위임
  useEffect(() => {
    const err = bindingsQuery.error ?? detailQuery.error;
    if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
  }, [bindingsQuery.error, detailQuery.error, handleApiError]);

  // 편집 폼 열릴 때 상세 description 동기화
  useEffect(() => {
    if (
      isFormOpen &&
      editingBinding != null &&
      detail != null &&
      detail.bindingId === editingBinding.bindingId
    ) {
      setForm((prev) => ({ ...prev, description: detail.description ?? '' }));
    }
  }, [isFormOpen, editingBinding, detail]);

  const selectedSystemTemplateId = Number(form.systemTemplateId);
  const selectedUserTemplateId = Number(form.userTemplateId);
  const selectedProfileId = Number(form.runtimeProfileId);

  const systemTemplateOptions = useMemo(
    () =>
      allTemplates.filter(
        (t) =>
          t.templateRole === 'SYSTEM' &&
          (t.isActive === 1 ||
            (Number.isFinite(selectedSystemTemplateId) &&
              t.templateId === selectedSystemTemplateId)),
      ),
    [allTemplates, selectedSystemTemplateId],
  );

  const userTemplateOptions = useMemo(
    () =>
      allTemplates.filter(
        (t) =>
          t.templateRole === 'USER' &&
          (t.isActive === 1 ||
            (Number.isFinite(selectedUserTemplateId) && t.templateId === selectedUserTemplateId)),
      ),
    [allTemplates, selectedUserTemplateId],
  );

  const runtimeProfileOptions = useMemo(
    () =>
      allProfiles.filter(
        (p) =>
          p.isActive === 1 ||
          (Number.isFinite(selectedProfileId) && p.runtimeProfileId === selectedProfileId),
      ),
    [allProfiles, selectedProfileId],
  );

  const saveMutation = useMutation({
    mutationFn: async (payload: {
      form: BindingForm;
      editingId: number | null;
    }) => {
      const { form: f, editingId } = payload;
      const req: AiPromptBindingCreateRequest = {
        bindingName: f.bindingName.trim(),
        domainType: f.domainType.trim(),
        featureKey: f.featureKey.trim(),
        systemTemplateId: Number(f.systemTemplateId),
        userTemplateId: Number(f.userTemplateId),
        runtimeProfileId: Number(f.runtimeProfileId),
        description: f.description.trim() || undefined,
      };
      if (editingId == null) {
        return assertOk(await createAiPromptBinding(req));
      }
      return assertOk(
        await updateAiPromptBinding(editingId, {
          bindingName: req.bindingName,
          domainType: req.domainType,
          systemTemplateId: req.systemTemplateId,
          userTemplateId: req.userTemplateId,
          runtimeProfileId: req.runtimeProfileId,
          description: req.description,
          isActive: f.isActive,
        }),
      );
    },
    onSuccess: async (_data, variables) => {
      notifySuccess(variables.editingId == null ? '등록되었습니다.' : '수정되었습니다.');
      setIsFormOpen(false);
      await queryClient.invalidateQueries({
        queryKey: adminKeys.ai.binding.list({ status, domain: domainFilter }),
      });
      if (selectedId != null) {
        await queryClient.invalidateQueries({ queryKey: adminKeys.ai.binding.detail(selectedId) });
      }
    },
    onError: (err: unknown) => {
      if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
    },
  });

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
    await saveMutation.mutateAsync({ form, editingId: editingBinding?.bindingId ?? null });
  };

  const loadBindings = useCallback(
    async (_s?: StatusFilter, _d?: string) => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.ai.binding.list({ status, domain: domainFilter }),
      });
    },
    [queryClient, status, domainFilter],
  );

  return {
    status,
    setStatus,
    domainFilter,
    setDomainFilter,
    bindings: bindingsQuery.data ?? [],
    loadBindings,
    selectedId,
    setSelectedId,
    detail,
    isFormOpen,
    setIsFormOpen,
    editingBinding,
    form,
    setForm,
    domainCodes: domainCodesQuery.data ?? [],
    systemTemplateOptions,
    userTemplateOptions,
    runtimeProfileOptions,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
  };
};
