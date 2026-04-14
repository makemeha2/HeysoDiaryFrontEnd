import { useCallback, useEffect, useState } from 'react';
import {
  getAiPromptTemplateList,
  getAiPromptTemplateDetail,
} from '@admin/lib/aiTemplateApi';
import type {
  AiPromptTemplateListItem,
  AiPromptTemplateDetail,
} from '@admin/types/aiTemplate';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';
import { useAdminPageContext } from '@admin/context/AdminPageContext';

export const useTemplateListState = () => {
  const { handleApiError, notifyError, loadComCodes } = useAdminPageContext();

  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [domainFilter, setDomainFilter] = useState<string>('');
  const [templates, setTemplates] = useState<AiPromptTemplateListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AiPromptTemplateDetail | null>(null);
  const [domainCodes, setDomainCodes] = useState<CommonCode[]>([]);
  const [fragmentOptions, setFragmentOptions] = useState<AiPromptTemplateListItem[]>([]);

  useEffect(() => {
    loadComCodes('aitp_domain').then(setDomainCodes);
  }, [loadComCodes]);

  const loadFragmentOptions = useCallback(async () => {
    const r = await getAiPromptTemplateList('ACTIVE', 'FRAGMENT');
    if (r.ok) setFragmentOptions(r.data ?? []);
  }, []);

  useEffect(() => {
    loadFragmentOptions();
  }, [loadFragmentOptions]);

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
    notifyError(null);
    setSelectedId(null);
    setDetail(null);
    loadTemplates(status, typeFilter, domainFilter);
  }, [status, typeFilter, domainFilter, loadTemplates, notifyError]);

  useEffect(() => {
    if (selectedId != null) loadDetail(selectedId);
    else setDetail(null);
  }, [selectedId, loadDetail]);

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
      templates,
      selectedId,
      setSelectedId,
      detail,
      domainCodes,
      fragmentOptions,
      loadTemplates,
      loadDetail,
      loadFragmentOptions,
    },
  };
};
