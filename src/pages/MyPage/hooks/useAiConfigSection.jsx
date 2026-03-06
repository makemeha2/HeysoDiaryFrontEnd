import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { authFetch } from '@lib/apiClient.js';

const INITIAL_AI_CONFIG = {
  userId: null,
  speechToneCd: 'POLITE',
  feedbackStyleCd: 'BALANCED',
  intensityCd: 'NORMAL',
  questionCd: 'ASK',
  lengthCd: 'MEDIUM',
  langModeCd: 'FOLLOW_DIARY',
  fixedLang: 'ko',
  createdAt: null,
  updatedAt: null,
};

export const useAiConfigSection = ({ alert, activeSection } = {}) => {
  const queryClient = useQueryClient();
  const [aiConfig, setAiConfig] = useState(INITIAL_AI_CONFIG);

  const enabled = activeSection === 'diary';
  const aiConfigQuery = useQuery({
    queryKey: ['aiFeedbackSetting'],
    enabled,
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch('/api/mypage/ai-feedback-setting', { method: 'GET', signal });
      if (!res.ok) throw new Error('Failed to load AI feedback setting');
      return res.data ?? {};
    },
  });

  useEffect(() => {
    if (!enabled) return;

    const data = aiConfigQuery.data;
    if (!data) return;

    setAiConfig(() => ({
      ...INITIAL_AI_CONFIG,
      userId: data.userId ?? null,
      speechToneCd: data.speechToneCd ?? INITIAL_AI_CONFIG.speechToneCd,
      feedbackStyleCd: data.feedbackStyleCd ?? INITIAL_AI_CONFIG.feedbackStyleCd,
      intensityCd: data.intensityCd ?? INITIAL_AI_CONFIG.intensityCd,
      questionCd: data.questionCd ?? INITIAL_AI_CONFIG.questionCd,
      lengthCd: data.lengthCd ?? INITIAL_AI_CONFIG.lengthCd,
      langModeCd: data.langModeCd ?? INITIAL_AI_CONFIG.langModeCd,
      fixedLang: data.fixedLang ?? INITIAL_AI_CONFIG.fixedLang,
      createdAt: data.createdAt ?? null,
      updatedAt: data.updatedAt ?? null,
    }));
  }, [enabled, aiConfigQuery.data, aiConfigQuery.dataUpdatedAt]);

  const saveAiConfigMutation = useMutation({
    mutationFn: async (data) => {
      const payload = {
        ...data,
        fixedLang: data.langModeCd === 'FIXED' ? data.fixedLang : '',
      };

      const res = await authFetch('/api/mypage/ai-feedback-setting', {
        method: 'POST',
        body: payload,
      });
      if (!res.ok) throw new Error(`Failed to save AI feedback setting: ${res.status}`);
      return res.data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['aiFeedbackSetting'] });

      await alert?.({
        title: '알림',
        description: '저장되었습니다.',
        actionLabel: '확인',
      });

      await aiConfigQuery.refetch();
    },
    onError: async (error) => {
      await alert?.({
        title: '오류',
        description: '오류가 발생했습니다. 관리자에게 문의하세요.',
        actionLabel: '확인',
      });
      console.error('Failed to save AI feedback setting', error);
    },
  });

  const saveAiConfig = useCallback(() => {
    if (saveAiConfigMutation.isPending) return;
    saveAiConfigMutation.mutate(aiConfig);
  }, [aiConfig, saveAiConfigMutation]);

  return {
    aiConfig,
    setAiConfig,
    saveAiConfig,
    isSavingAiConfig: saveAiConfigMutation.isPending,
    isLoadingAiConfig: aiConfigQuery.isLoading,
  };
};
