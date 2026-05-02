import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareText } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import { Button } from '@/components/ui/button';
import { authFetch } from '@lib/apiClient.js';

const mdParser = new MarkdownIt({ breaks: true });

export default function AiCommentPanel({ diaryId }: { diaryId: number | null }) {
  const queryClient = useQueryClient();
  const commentsQuery = useQuery({
    queryKey: ['diaryAiComments', diaryId],
    enabled: !!diaryId,
    queryFn: async ({ signal }) => {
      const res = await authFetch(`/api/diary/${diaryId}/ai-comments`, {
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

  const createCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/diary/${diaryId}/ai-comment`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create AI comment');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['diaryAiComments', diaryId], (prev: unknown) => [data, ...(Array.isArray(prev) ? prev : [])]);
    },
  });

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 font-semibold">
          <MessageSquareText className="h-4 w-4 text-primary" />
          AI 코멘트
        </div>
        <Button size="sm" disabled={!diaryId || createCommentMutation.isPending} onClick={() => createCommentMutation.mutate()}>
          {createCommentMutation.isPending ? '작성 중' : '생성'}
        </Button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto rounded-lg border border-border bg-card p-4">
        {!diaryId ? (
          <p className="text-sm leading-6 text-muted-foreground">저장되지 않은 새 일기에는 AI 코멘트를 생성할 수 없습니다.</p>
        ) : commentsQuery.isLoading || createCommentMutation.isPending ? (
          <p className="text-sm leading-6 text-muted-foreground">AI 코멘트를 불러오는 중입니다.</p>
        ) : createCommentMutation.isError ? (
          <p className="text-sm leading-6 text-destructive">AI 코멘트 생성에 실패했습니다.</p>
        ) : latestComment?.contentMd ? (
          <div
            className="prose prose-sm max-w-none text-foreground prose-p:text-foreground"
            dangerouslySetInnerHTML={{ __html: mdParser.render(latestComment.contentMd) }}
          />
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">AI가 이 일기를 읽고 공감과 피드백을 남길 수 있습니다.</p>
        )}
      </div>
    </div>
  );
}
