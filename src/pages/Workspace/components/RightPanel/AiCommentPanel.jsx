import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import MarkdownIt from 'markdown-it';
import markdownItIns from 'markdown-it-ins';
import { MessageSquareHeart } from 'lucide-react';

import { authFetch } from '@lib/apiClient.js';

const parser = new MarkdownIt({ breaks: true });
parser.use(markdownItIns);

const AiCommentPanel = ({ diaryId }) => {
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

  const latest = useMemo(() => {
    const list = commentsQuery.data ?? [];
    return [...list].sort((a, b) => new Date(b?.createdAt ?? 0) - new Date(a?.createdAt ?? 0))[0] ?? null;
  }, [commentsQuery.data]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/diary/${diaryId}/ai-comment`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create AI comment');
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['diaryAiComments', diaryId], (prev = []) => [data, ...(Array.isArray(prev) ? prev : [])]);
    },
  });

  if (!diaryId) {
    return <p className="text-sm leading-6 text-clay/65">저장 후 코멘트를 받을 수 있습니다.</p>;
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
        disabled={createMutation.isPending}
        onClick={() => createMutation.mutate()}
      >
        <MessageSquareHeart className="h-4 w-4" />
        {createMutation.isPending ? '작성 중' : '코멘트 받기'}
      </button>

      {commentsQuery.isLoading ? (
        <p className="text-sm text-clay/60">불러오는 중입니다.</p>
      ) : createMutation.isError || commentsQuery.isError ? (
        <p className="text-sm text-red-600">AI 코멘트를 불러오지 못했습니다.</p>
      ) : latest?.contentMd ? (
        <div
          className="prose prose-sm max-w-none text-clay"
          dangerouslySetInnerHTML={{ __html: parser.render(latest.contentMd) }}
        />
      ) : (
        <p className="text-sm leading-6 text-clay/65">아직 코멘트가 없습니다.</p>
      )}
    </div>
  );
};

export default AiCommentPanel;

