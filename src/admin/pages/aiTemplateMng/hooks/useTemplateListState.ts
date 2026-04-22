import { useCallback, useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAiPromptTemplateList,
} from '../api/aiTemplateApi';
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

  const fragmentOptionsQuery = useQuery({
    queryKey: adminKeys.ai.template.fragmentOptions(),
    queryFn: () => getAiPromptTemplateList('ACTIVE', 'FRAGMENT').then(assertOk),
    staleTime: 60_000,
  });

  const domainCodesQuery = useComCodesQuery('aitp_domain');

  // 필터 변경 시 선택 초기화
  useEffect(() => {
    notifyError(null);
  }, [status, typeFilter, domainFilter, notifyError]);

  // 쿼리 에러 → 컨텍스트 에러 핸들러로 위임
  useEffect(() => {
    const err = templatesQuery.error;
    if (err instanceof AdminApiError) handleApiError(err.status, err.errorMessage);
  }, [templatesQuery.error, handleApiError]);

  const loadTemplates = useCallback(
    async () => {
      await queryClient.invalidateQueries({
        queryKey: adminKeys.ai.template.list({ status, type: typeFilter, domain: domainFilter }),
      });
    },
    [queryClient, status, typeFilter, domainFilter],
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
      domainCodes: domainCodesQuery.data ?? [],
      fragmentOptions: fragmentOptionsQuery.data ?? [],
      loadTemplates,
      loadFragmentOptions,
    },
  };
};
