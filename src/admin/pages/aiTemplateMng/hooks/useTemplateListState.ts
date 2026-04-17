import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAiPromptTemplateList,
  getAiPromptTemplateDetail,
} from '@admin/lib/aiTemplateApi';
import { assertOk, AdminApiError } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import useComCodesQuery from '@admin/features/commonCode/hooks/useComCodesQuery';
import type { StatusFilter } from '@admin/types/comCd';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

export const useTemplateListState = () => {
  const queryClient = useQueryClient();
  const { handleApiError, notifyError } = useAdminPageContext();

  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const templatesQuery = useQuery({
    queryKey: adminKeys.ai.template.list({ status, type: typeFilter, domain: domainFilter }),
    queryFn: () =>
      getAiPromptTemplateList(
        status,
        typeFilter === 'ALL' ? undefined : typeFilter,
        domainFilter || undefined,
      ).then(assertOk),
    staleTime: 0,
  });

  const detailQuery = useQuery({
    queryKey: adminKeys.ai.template.detail(selectedId!),
    queryFn: () => getAiPromptTemplateDetail(selectedId!).then(assertOk),
    enabled: selectedId != null,
    staleTime: 0,
  });

  const fragmentOptionsQuery = useQuery({
    queryKey: adminKeys.ai.template.fragmentOptions(),
    queryFn: () => getAiPromptTemplateList('ACTIVE', 'FRAGMENT').then(assertOk),
    staleTime: 60_000,
  });

  const domainCodesQuery = useComCodesQuery('aitp_domain');

  // 필터 변경 시 선택 초기화
  useEffect(() => {
    setSelectedId(null);
    notifyError(null);
  }, [status, typeFilter, domainFilter, notifyError]);

  // 쿼리 에러 → 컨텍스트 에러 핸들러로 위임
  useEffect(() => {
    const err = templatesQuery.error ?? detailQuery.error;
    if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
  }, [templatesQuery.error, detailQuery.error, handleApiError]);

  const loadTemplates = useCallback(
    async (_s?: StatusFilter, _t?: string, _d?: string) => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.ai.template.list({ status, type: typeFilter, domain: domainFilter }),
      });
    },
    [queryClient, status, typeFilter, domainFilter],
  );

  const loadDetail = useCallback(
    async (id: number) => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.ai.template.detail(id) });
    },
    [queryClient],
  );

  const loadFragmentOptions = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: adminKeys.ai.template.fragmentOptions() });
  }, [queryClient]);

  return {
    filters: {
      status,
      setStatus,
      typeFilter,
      setTypeFilter,
      domainFilter,
      setDomainFilter,
    },
    list: {
      templates: templatesQuery.data ?? [],
      selectedId,
      setSelectedId,
      detail: detailQuery.data ?? null,
      domainCodes: domainCodesQuery.data ?? [],
      fragmentOptions: fragmentOptionsQuery.data ?? [],
      loadTemplates,
      loadDetail,
      loadFragmentOptions,
    },
  };
};
