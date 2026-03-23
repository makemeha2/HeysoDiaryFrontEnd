import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { requestDiaryAiPolish } from '../api/diaryAiPolishApi.js';

const DAILY_POLISH_LIMIT = 3;

const getPolishErrorDescription = (error) => {
  const status = error?.status;
  const serverMessage =
    (typeof error?.data?.message === 'string' && error.data.message) ||
    (typeof error?.data?.error === 'string' && error.data.error) ||
    (typeof error?.message === 'string' && error.message) ||
    '';

  if (status === 429) {
    return '오늘 글다듬기 사용 횟수를 모두 사용했어요. 내일 다시 시도해 주세요.';
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
  const [polishedContent, setPolishedContent] = useState('');
  const [polishError, setPolishError] = useState('');
  const [remainingCount, setRemainingCount] = useState(null);

  const polishMutation = useMutation({
    mutationFn: requestDiaryAiPolish,
  });

  const requestPolish = async ({ diaryId = null, content }) => {
    setPolishError('');
    setPolishedContent('');

    try {
      const data = await polishMutation.mutateAsync({
        diaryId,
        content,
      });

      const nextPolishedContent =
        typeof data?.polishedContent === 'string' ? data.polishedContent : '';

      if (!nextPolishedContent.trim()) {
        setPolishError('교정 결과를 가져오지 못했어요. 잠시 후 다시 시도해 주세요.');
        return;
      }

      setPolishedContent(nextPolishedContent);

      if (typeof data?.remainingCount === 'number') {
        setRemainingCount(data.remainingCount);
      }
    } catch (error) {
      setPolishError(getPolishErrorDescription(error));
    }
  };

  const resetPolish = () => {
    setPolishedContent('');
    setPolishError('');
    setRemainingCount(null);
  };

  const usedCount = useMemo(() => {
    if (typeof remainingCount !== 'number') return null;
    return Math.max(0, DAILY_POLISH_LIMIT - remainingCount);
  }, [remainingCount]);

  const usageText = useMemo(() => {
    if (typeof usedCount !== 'number') {
      return '사용량 확인 전';
    }
    return `${usedCount}/${DAILY_POLISH_LIMIT} 사용`;
  }, [usedCount]);

  return {
    polishedContent,
    polishError,
    remainingCount,
    isPolishing: polishMutation.isPending,
    usageText,
    requestPolish,
    resetPolish,
  };
};

export default useDiaryAiPolish;

export { DAILY_POLISH_LIMIT };

