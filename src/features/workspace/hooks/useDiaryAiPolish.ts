import { useCallback, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import {
  requestDiaryAiPolish,
  type DiaryAiPolishErrorData,
  type DiaryAiPolishRequest,
  type DiaryAiPolishResponse,
} from '../api/diaryAiPolishApi';
import { AI_QUOTA_QUERY_KEY } from './useAiQuota';

type PolishError = Error & {
  status?: number;
  data?: DiaryAiPolishErrorData;
};

const getPolishErrorDescription = (error: PolishError) => {
  const status = error?.status;
  const serverMessage =
    (typeof error?.data?.message === 'string' && error.data.message) ||
    (typeof error?.data?.error === 'string' && error.data.error) ||
    (typeof error?.message === 'string' && error.message) ||
    '';

  if (status === 429) {
    return serverMessage || '오늘의 AI 사용 횟수를 모두 사용했어요. 광고를 시청하면 추가 사용이 가능합니다.';
  }

  if (status === 400) {
    if (/at least 50/i.test(serverMessage)) {
      return '글다듬기는 50자 이상부터 요청할 수 있어요.';
    }

    if (/2000 characters or less/i.test(serverMessage)) {
      return '글 길이가 너무 길어요. 현재 서버 기준으로 2000자 이하에서 요청해 주세요.';
    }

    return '입력한 글을 다시 확인해 주세요.';
  }

  if (status === 401 || status === 403) {
    return '로그인 상태를 확인한 뒤 다시 시도해 주세요.';
  }

  return '글다듬기 중 문제가 발생했어요. 잠시 후 다시 시도해 주세요.';
};

const useDiaryAiPolish = () => {
  const queryClient = useQueryClient();
  const [polishedContent, setPolishedContent] = useState('');
  const [polishError, setPolishError] = useState('');

  const polishMutation = useMutation<DiaryAiPolishResponse, PolishError, DiaryAiPolishRequest>({
    mutationFn: requestDiaryAiPolish,
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: AI_QUOTA_QUERY_KEY });
    },
  });

  const clearPolishResult = useCallback(() => {
    setPolishedContent('');
    setPolishError('');
  }, []);

  const requestPolish = async ({ diaryId = null, content, mode }: DiaryAiPolishRequest) => {
    setPolishError('');
    setPolishedContent('');

    try {
      const data = await polishMutation.mutateAsync({
        diaryId,
        content,
        mode,
      });

      const nextPolishedContent =
        typeof data?.polishedContent === 'string' ? data.polishedContent : '';

      if (!nextPolishedContent.trim()) {
        setPolishError('교정 결과를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }

      setPolishedContent(nextPolishedContent);
    } catch (error) {
      const polishError = error as PolishError;
      const description = getPolishErrorDescription(polishError);
      setPolishError(description);

      if (polishError?.status === 429) {
        const dailyLimit = polishError.data?.dailyLimit;
        const remainingCount = polishError.data?.remainingCount;
        const quotaText =
          typeof dailyLimit === 'number' && typeof remainingCount === 'number'
            ? ` (남은 횟수 ${remainingCount}/${dailyLimit})`
            : '';
        toast.error(`${description}${quotaText}`);
      }
    }
  };

  const resetPolish = () => {
    setPolishedContent('');
    setPolishError('');
  };

  return {
    polishedContent,
    polishError,
    isPolishing: polishMutation.isPending,
    requestPolish,
    resetPolish,
    clearPolishResult,
  };
};

export default useDiaryAiPolish;
