// src/pages/Diary/components/DiaryAiCommentSection.jsx
import { useEffect, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquareHeart } from 'lucide-react';
import MarkdownIt from 'markdown-it';
import markdownItIns from 'markdown-it-ins';
import { authFetch } from '@lib/apiClient.js';

const mdParser = new MarkdownIt({ breaks: true });
mdParser.use(markdownItIns);

const DiaryAiCommentSection = ({ diaryId }) => {
  const queryClient = useQueryClient();

  const aiCommentsQuery = useQuery({
    queryKey: ['diaryAiComments', diaryId],
    enabled: !!diaryId,
    staleTime: 0,
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
    const list = aiCommentsQuery.data ?? [];
    if (!list.length) return null;

    // 서버 정렬을 신뢰해도 되지만, 안전하게 최신 선택 유지
    const [latest] = [...list].sort((a, b) => {
      const left = new Date(a?.createdAt ?? 0).getTime();
      const right = new Date(b?.createdAt ?? 0).getTime();
      return right - left;
    });
    return latest?.contentMd ? latest : null;
  }, [aiCommentsQuery.data]);

  const createAiCommentMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch(`/api/diary/${diaryId}/ai-comment`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to create AI comment');
      return res.data ?? null;
    },
    onSuccess: (data) => {
      if (!data?.aiCommentId) return;

      queryClient.setQueryData(['diaryAiComments', diaryId], (prev = []) => {
        const next = Array.isArray(prev) ? prev : [];
        return [data, ...next];
      });
    },
  });

  // diaryId 바뀌면 이전 에러 상태 같은 것 리셋
  useEffect(() => {
    createAiCommentMutation.reset();
  }, [diaryId]);

  const isWriting = createAiCommentMutation.isPending;
  const errorMessage = createAiCommentMutation.isError
    ? 'AI 댓글을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.'
    : '';

  return (
    <section className="rounded-2xl border border-sand/30 bg-sand/5 p-5 shadow-soft">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-clay/80">한마디 들어볼까?</h3>

        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-amber/30 bg-amber px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-amber-600 hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber/60 focus-visible:ring-offset-2 active:translate-y-0 active:shadow-sm"
          aria-label="AI 댓글 요청"
          onClick={() => {
            if (!diaryId || isWriting) return;
            createAiCommentMutation.mutate();
          }}
          disabled={!diaryId || isWriting}
        >
          <MessageSquareHeart className="h-3.5 w-3.5" />
          {isWriting ? '작성 중...' : 'OK'}
        </button>
      </div>

      {isWriting ? (
        <p className="text-sm leading-6 text-clay/80">
          AI가 댓글을 작성 중입니다. 잠시만 기다려 주세요.
        </p>
      ) : errorMessage ? (
        <p className="text-sm leading-6 text-red-600">{errorMessage}</p>
      ) : latestComment?.contentMd ? (
        <div
          className={[
            'prose prose-sm max-w-none',
            'prose-headings:text-clay',
            'prose-p:text-clay/90',
            'prose-strong:text-clay',
            'prose-li:text-clay/90',
            'prose-blockquote:text-clay/80',
            'prose-a:text-amber-900',
            'leading-6',
          ].join(' ')}
          dangerouslySetInnerHTML={{ __html: mdParser.render(latestComment.contentMd) }}
        />
      ) : (
        <p className="text-sm leading-6 text-clay/80">
          AI가 이 일기를 읽고 공감과 피드백을 남겨줄 공간입니다.
        </p>
      )}
    </section>
  );
};

export default DiaryAiCommentSection;
