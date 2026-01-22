import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authFetch } from '@lib/apiClient.js';

const PAGE = 1;
const SIZE = 100;
const MESSAGE_LIMIT = 100;

/**
 * AI Chat 데이터(목록/상세/요약) + 뮤테이션(생성/전송/이름변경/삭제)을 관리하는 훅
 */
export default function useAiChatData({
    activeConversationId,
    setActiveConversationId,
    setErrorMessage,
    setMessageInput,
} = {}) {
    const queryClient = useQueryClient();

    /** 대화방 목록 조회 */
    const conversationsQuery = useQuery({
        queryKey: ['aiChatConversations', PAGE, SIZE],
        staleTime: 0,
        queryFn: async ({ signal }) => {
            const res = await authFetch('/api/aichat/conversations', {
                method: 'GET',
                params: { page: PAGE, size: SIZE },
                signal,
            });
            if (!res.ok) throw new Error('Failed to load conversations');
            return Array.isArray(res.data?.conversations) ? res.data.conversations : [];
        },
        onSuccess: () => setErrorMessage?.(''),
        onError: () => setErrorMessage?.('대화 목록을 불러오지 못했습니다.'),
    });

    /** 대화방 상세 조회 */
    const conversationDetailQuery = useQuery({
        queryKey: ['aiChatConversation', activeConversationId, MESSAGE_LIMIT],
        enabled: !!activeConversationId,
        staleTime: 0,
        queryFn: async ({ signal }) => {
            const res = await authFetch(`/api/aichat/conversations/${activeConversationId}`, {
                method: 'GET',
                params: { messageLimit: MESSAGE_LIMIT },
                signal,
            });
            if (!res.ok) throw new Error('Failed to load conversation detail');
            return res.data ?? null;
        },
        onSuccess: () => setErrorMessage?.(''),
        onError: () => setErrorMessage?.('대화 내용을 불러오지 못했습니다.'),
    });

    /** 요약 조회 */
    const summaryQuery = useQuery({
        queryKey: ['aiChatSummary', activeConversationId],
        enabled: !!activeConversationId,
        staleTime: 0,
        queryFn: async ({ signal }) => {
            const res = await authFetch(`/api/aichat/conversations/${activeConversationId}/summary`, {
                method: 'GET',
                signal,
            });
            if (!res.ok) return null;
            return res.data ?? null;
        },
    });

    const conversations = conversationsQuery.data ?? [];
    const conversationDetail = conversationDetailQuery.data ?? null;
    const messages = conversationDetail?.messages ?? [];
    const summary = summaryQuery.data ?? null;

    const activeConversation =
        conversationDetail?.conversationId === activeConversationId
            ? conversationDetail
            : conversations.find((item) => item.conversationId === activeConversationId);

    /** 새 대화방 생성 */
    const createConversationMutation = useMutation({
        mutationFn: async () => {
            const res = await authFetch('/api/aichat/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: 'New chat' }),
            });
            if (!res.ok) throw new Error('Failed to create conversation');
            return res.data ?? null;
        },
        onMutate: () => setErrorMessage?.(''),
        onSuccess: async (data) => {
            const createdId = data?.conversationId ?? null;

            await queryClient.invalidateQueries({ queryKey: ['aiChatConversations'] });

            if (createdId) {
                queryClient.setQueryData(['aiChatConversation', createdId, MESSAGE_LIMIT], {
                    conversationId: createdId,
                    messages: [],
                });
                queryClient.setQueryData(['aiChatSummary', createdId], null);
            }

            setActiveConversationId?.(createdId);
            setMessageInput?.('');
        },
        onError: () => setErrorMessage?.('새 대화를 만들지 못했습니다.'),
    });

    /** 메시지 전송(optimistic update) */
    const sendMessageMutation = useMutation({
        mutationFn: async ({ conversationId, messageText, localMessageId, parentMessageId }) => {
            const res = await authFetch(`/api/aichat/conversations/${conversationId}/assistant-reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userContent: messageText,
                    userClientMessageId: localMessageId,
                    parentMessageId,
                    assistantContentFormat: 'text',
                }),
            });
            if (!res.ok) throw new Error('Failed to send message');
            return res.data ?? {};
        },
        onMutate: async ({ conversationId, messageText, localMessageId }) => {
            setErrorMessage?.('');

            await queryClient.cancelQueries({
                queryKey: ['aiChatConversation', conversationId, MESSAGE_LIMIT],
            });

            const prevDetail = queryClient.getQueryData([
                'aiChatConversation',
                conversationId,
                MESSAGE_LIMIT,
            ]);

            const prevMessages = prevDetail?.messages ?? [];
            const nextDetail = {
                ...(prevDetail ?? { conversationId }),
                messages: [
                    ...prevMessages,
                    {
                        messageId: localMessageId,
                        role: 'USER',
                        content: messageText,
                        createdAt: new Date().toISOString(),
                    },
                ],
            };

            queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], nextDetail);
            setMessageInput?.('');
            return { prevDetail };
        },
        onSuccess: (data, { conversationId, localMessageId }) => {
            const { userMessageId, assistantMessageId, assistantContent } = data ?? {};

            queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], (prev) => {
                if (!prev) return prev;

                const nextMessages = (prev.messages ?? []).map((message) => {
                    if (message.messageId !== localMessageId) return message;
                    return { ...message, messageId: userMessageId ?? message.messageId };
                });

                if (assistantContent) {
                    nextMessages.push({
                        messageId: assistantMessageId ?? `assistant-${Date.now()}`,
                        role: 'ASSISTANT',
                        content: assistantContent,
                        createdAt: new Date().toISOString(),
                    });
                }

                return { ...prev, messages: nextMessages };
            });

            // 표시용 updatedAt 반영
            queryClient.setQueryData(['aiChatConversations', PAGE, SIZE], (prev = []) =>
                prev.map((item) =>
                    item.conversationId === conversationId
                        ? { ...item, updatedAt: new Date().toISOString() }
                        : item,
                ),
            );

            queryClient.invalidateQueries({ queryKey: ['aiChatSummary', conversationId] });
        },
        onError: (_err, { conversationId }, context) => {
            if (context?.prevDetail) {
                queryClient.setQueryData(
                    ['aiChatConversation', conversationId, MESSAGE_LIMIT],
                    context.prevDetail,
                );
            }
            setErrorMessage?.('메시지를 전송하지 못했습니다.');
        },
    });

    /** 대화방 이름 변경 */
    const renameConversationMutation = useMutation({
        mutationFn: async ({ conversationId, title }) => {
            const res = await authFetch(`/api/aichat/conversations/${conversationId}/update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title }),
            });
            if (!res.ok) throw new Error('Failed to update conversation');
            return res.data ?? null;
        },
        onSuccess: (_data, { conversationId, title }) => {
            queryClient.setQueryData(['aiChatConversations', PAGE, SIZE], (prev = []) =>
                prev.map((item) => (item.conversationId === conversationId ? { ...item, title } : item)),
            );
            queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], (prev) =>
                prev ? { ...prev, title } : prev,
            );
        },
        onError: () => setErrorMessage?.('이름을 변경하지 못했습니다.'),
    });

    /** 대화방 삭제 */
    const deleteConversationMutation = useMutation({
        mutationFn: async ({ conversationId }) => {
            const res = await authFetch(`/api/aichat/conversations/${conversationId}/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            if (!res.ok) throw new Error('Failed to delete conversation');
            return res.data ?? null;
        },
        onSuccess: async () => {
            setErrorMessage?.('');

            // 삭제 후 목록 재조회(백엔드 정렬 신뢰)
            const { data } = await conversationsQuery.refetch();
            const nextList = Array.isArray(data) ? data : [];

            setActiveConversationId?.(nextList[0]?.conversationId ?? null);
        },
        onError: () => setErrorMessage?.('대화방 삭제에 실패했습니다.'),
    });

    /** 새 채팅 생성 실행 */
    const createNewChat = () => createConversationMutation.mutate();

    /**
     * 메시지 전송 실행
     * - parentMessageId는 “마지막 서버 메시지 id”를 넘기는 방식 유지
     */
    const sendMessage = ({ conversationId, messageText }) => {
        const localMessageId = `local-${Date.now()}`;

        const lastServerMessageId = [...messages]
            .map((m) => m?.messageId)
            .filter((v) => typeof v === 'number')
            .pop();

        sendMessageMutation.mutate({
            conversationId,
            messageText,
            localMessageId,
            parentMessageId: lastServerMessageId,
        });
    };

    /** 대화방 이름 변경 실행 */
    const renameConversation = ({ conversationId, title }) =>
        renameConversationMutation.mutate({ conversationId, title });

    /** 대화방 삭제 실행 */
    const deleteConversation = ({ conversationId }) =>
        deleteConversationMutation.mutate({ conversationId });

    return {
        // data
        conversations,
        activeConversation,
        conversationDetail,
        messages,
        summary,

        // query states
        conversationsQuery,
        conversationDetailQuery,
        summaryQuery,

        // mutations
        createConversationMutation,
        sendMessageMutation,
        renameConversationMutation,
        deleteConversationMutation,

        // actions
        createNewChat,
        sendMessage,
        renameConversation,
        deleteConversation,
    };
}
