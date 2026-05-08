import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, Sparkles } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { toast } from 'sonner';
import { authFetch } from '@lib/apiClient';
import { AI_QUOTA_QUERY_KEY } from '../../hooks/useAiQuota';

const mdParser = new MarkdownIt({ breaks: true });

type AiComment = {
  contentMd?: string;
  createdAt?: string;
  remainingCount?: number;
  dailyLimit?: number;
};

type AiCommentErrorData = {
  message?: string;
  error?: string;
  remainingCount?: number;
  dailyLimit?: number;
};

type AiCommentError = Error & {
  status?: number;
  data?: AiCommentErrorData;
};

const getAiCommentErrorMessage = (error: AiCommentError) => {
  const serverMessage =
    (typeof error?.data?.message === 'string' && error.data.message) ||
    (typeof error?.data?.error === 'string' && error.data.error) ||
    '';

  if (error.status === 429) {
    return serverMessage || '오늘의 AI 사용 횟수를 모두 사용했어요. 광고를 시청하면 추가 사용이 가능합니다.';
  }

  return 'AI 코멘트를 불러오거나 생성하지 못했습니다.';
};

const AiCommentPanel = ({ diaryId }: { diaryId: number | null }) => {
  const queryClient = useQueryClient();
  const commentsQuery = useQuery({
    queryKey: ['diaryAiComments', diaryId],
    enabled: !!diaryId,
    queryFn: async ({ signal }) => {
      const res = await authFetch<AiComment[]>(`/api/diary/${diaryId}/ai-comments`, {
        method: 'GET',
        params: { limit: 1 },
        signal,
      });
      if (!res.ok) throw new Error('Failed to load AI comments');
      return Array.isArray(res.data) ? res.data : [];
    },
  });

  const latestComment = useMemo(() => {
    const list = commentsQuery.data ?? [];
    return [...list].sort((a, b) => new Date(b?.createdAt ?? 0).getTime() - new Date(a?.createdAt ?? 0).getTime())[0] ?? null;
  }, [commentsQuery.data]);

  const createCommentMutation = useMutation<AiComment, AiCommentError>({
    mutationFn: async () => {
      const res = await authFetch<AiComment | AiCommentErrorData>(`/api/diary/${diaryId}/ai-comment`, { method: 'POST' });
      if (!res.ok) {
        const data = res.data as AiCommentErrorData;
        const message =
          (typeof data?.message === 'string' && data.message) ||
          (typeof data?.error === 'string' && data.error) ||
          'Failed to create AI comment';
        const error = new Error(message) as AiCommentError;
        error.status = res.status;
        error.data = data;
        throw error;
      }
      return res.data as AiComment;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['diaryAiComments', diaryId], (prev: unknown) => [data, ...(Array.isArray(prev) ? prev : [])]);
    },
    onError: (error) => {
      if (error.status === 429) {
        const message = getAiCommentErrorMessage(error);
        const dailyLimit = error.data?.dailyLimit;
        const remainingCount = error.data?.remainingCount;
        const quotaText =
          typeof dailyLimit === 'number' && typeof remainingCount === 'number'
            ? ` (남은 횟수 ${remainingCount}/${dailyLimit})`
            : '';
        toast.error(`${message}${quotaText}`);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: AI_QUOTA_QUERY_KEY });
    },
  });

  const isLoading = commentsQuery.isLoading || createCommentMutation.isPending;
  const canCreate = !!diaryId && !isLoading;
  const hasComment = !!latestComment?.contentMd;

  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center gap-3 px-4 py-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-xs text-muted-foreground">AI가 읽고 있어요...</p>
      </div>
    );
  }

  if (hasComment) {
    return (
      <div className="flex h-full flex-col gap-3 overflow-y-auto px-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-medium text-primary">AI 코멘트</span>
        </div>
        <div className="rounded-lg border border-border/60 bg-surface p-4">
          <div
            className="prose prose-sm max-w-none text-xs leading-relaxed text-foreground prose-p:my-2 prose-p:text-foreground prose-ul:my-2 prose-li:my-0"
            dangerouslySetInnerHTML={{ __html: mdParser.render(latestComment.contentMd ?? '') }}
          />
        </div>
        <button
          type="button"
          onClick={() => createCommentMutation.mutate()}
          disabled={!canCreate}
          className="self-end text-xs text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          다시 생성
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center gap-4 px-4 py-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-6 w-6 text-primary" />
      </div>
      <div className="text-center">
        <p className="mb-1 text-sm font-medium text-foreground">AI 코멘트</p>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {diaryId ? (
            <>
              오늘의 일기에 대한 따뜻한
              <br />
              AI 피드백을 받아보세요.
            </>
          ) : (
            <>
              저장되지 않은 새 일기에는
              <br />
              AI 코멘트를 생성할 수 없습니다.
            </>
          )}
        </p>
      </div>
      {commentsQuery.isError || createCommentMutation.isError ? (
        <p className="text-center text-xs leading-relaxed text-destructive">
          {createCommentMutation.isError
            ? getAiCommentErrorMessage(createCommentMutation.error as AiCommentError)
            : 'AI 코멘트를 불러오거나 생성하지 못했습니다.'}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => createCommentMutation.mutate()}
        disabled={!canCreate}
        className="rounded-md bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        코멘트 받기
      </button>
    </div>
  );
};

export default AiCommentPanel;
