import { useEffect, useReducer, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as Dialog from '@radix-ui/react-dialog';
import { EllipsisVertical } from 'lucide-react';

import { authFetch } from '@lib/apiClient.js';
import ConfirmDialog from '@components/ConfirmDialog.jsx';

dayjs.extend(relativeTime);

const PAGE = 1;
const SIZE = 100;
const MESSAGE_LIMIT = 100;

/* ===========================
 * Reducer: 메뉴/다이얼로그(이름변경/삭제) UI 상태 통합
 * =========================== */
const initialUiState = {
  openedMenuConversationId: null, // 현재 ... 메뉴가 열린 대화방ID
  mode: 'idle', // 'idle' | 'rename' | 'delete'
  targetConversationId: null, // rename/delete 대상 대화방ID
  renameTitle: '', // rename 입력값
};

function uiReducer(state, action) {
  switch (action.type) {
    case 'MENU_TOGGLE': {
      const nextId =
        state.openedMenuConversationId === action.conversationId ? null : action.conversationId;
      return { ...state, openedMenuConversationId: nextId };
    }

    case 'MENU_CLOSE':
      return { ...state, openedMenuConversationId: null };

    case 'RENAME_OPEN':
      return {
        ...state,
        mode: 'rename',
        targetConversationId: action.conversationId,
        renameTitle: action.title ?? '',
        openedMenuConversationId: null, // 모달 열 때 메뉴는 닫기
      };

    case 'RENAME_CHANGE':
      return { ...state, renameTitle: action.value };

    case 'RENAME_CLOSE':
      return {
        ...state,
        mode: 'idle',
        targetConversationId: null,
        renameTitle: '',
      };

    case 'DELETE_OPEN':
      return {
        ...state,
        mode: 'delete',
        targetConversationId: action.conversationId,
        openedMenuConversationId: null, // 다이얼로그 열 때 메뉴는 닫기
      };

    case 'DELETE_CLOSE':
      return {
        ...state,
        mode: 'idle',
        targetConversationId: null,
      };

    case 'RESET':
      return initialUiState;

    default:
      return state;
  }
}

const AiChatMain = () => {
  const queryClient = useQueryClient();

  /* ===========================
   * State
   * =========================== */
  const [activeConversationId, setActiveConversationId] = useState(null);

  // 입력 + 오류
  const [messageInput, setMessageInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // UI 상태(reducer)
  const [ui, dispatchUi] = useReducer(uiReducer, initialUiState);

  /* ===========================
   * Refs
   * =========================== */
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const renameInputRef = useRef(null);

  /* ===========================
   * Utils
   * =========================== */

  /** 상대 시간 표시 (예: 3분 전) */
  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    return dayjs(timestamp).fromNow();
  };

  /* ===========================
   * Queries
   * =========================== */

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
    onSuccess: () => {
      // 목록 조회 성공 시 오류 메시지 클리어
      setErrorMessage('');
    },
    onError: () => {
      setErrorMessage('대화 목록을 불러오지 못했습니다.');
    },
  });

  /** 선택된 대화방 상세(메시지 포함) 조회 */
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
    onSuccess: () => {
      setErrorMessage('');
    },
    onError: () => {
      setErrorMessage('대화 내용을 불러오지 못했습니다.');
    },
  });

  /** 선택된 대화방 요약 조회 */
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

  // 활성 대화방 정보 (detail 우선, 없으면 목록에서 찾기)
  const activeConversation =
    conversationDetail?.conversationId === activeConversationId
      ? conversationDetail
      : conversations.find((item) => item.conversationId === activeConversationId);

  /* ===========================
   * Mutations
   * =========================== */

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
    onMutate: () => {
      // 생성 시도 전 오류 메시지 클리어
      setErrorMessage('');
    },
    onSuccess: async (data) => {
      const createdId = data?.conversationId ?? null;

      // 목록 최신화
      await queryClient.invalidateQueries({ queryKey: ['aiChatConversations'] });

      // 캐시 초기값(옵션)
      if (createdId) {
        queryClient.setQueryData(['aiChatConversation', createdId, MESSAGE_LIMIT], {
          conversationId: createdId,
          messages: [],
        });
        queryClient.setQueryData(['aiChatSummary', createdId], null);
      }

      // 신규 대화로 이동
      setActiveConversationId(createdId);
      setMessageInput('');
      dispatchUi({ type: 'RESET' }); // UI상태 초기화
    },
    onError: () => {
      setErrorMessage('새 대화를 만들지 못했습니다.');
    },
  });

  /** 메시지 전송(optimistic update 포함) */
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
      // 전송 전: 에러 제거 + 해당 대화 캐시 업데이트를 위한 cancel
      setErrorMessage('');
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

      // optimistic UI 반영
      queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], nextDetail);
      setMessageInput('');
      return { prevDetail };
    },
    onSuccess: (data, { conversationId, localMessageId }) => {
      // 서버에서 내려준 messageId로 치환 + assistant reply append
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

      // 목록의 updatedAt 갱신(표시용)
      queryClient.setQueryData(['aiChatConversations', PAGE, SIZE], (prev = []) =>
        prev.map((item) =>
          item.conversationId === conversationId
            ? { ...item, updatedAt: new Date().toISOString() }
            : item,
        ),
      );

      // summary 무효화
      queryClient.invalidateQueries({ queryKey: ['aiChatSummary', conversationId] });
    },
    onError: (_err, { conversationId }, context) => {
      // optimistic rollback
      if (context?.prevDetail) {
        queryClient.setQueryData(
          ['aiChatConversation', conversationId, MESSAGE_LIMIT],
          context.prevDetail,
        );
      }
      setErrorMessage('메시지를 전송하지 못했습니다.');
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
      // 목록/상세 캐시 동기화
      queryClient.setQueryData(['aiChatConversations', PAGE, SIZE], (prev = []) =>
        prev.map((item) => (item.conversationId === conversationId ? { ...item, title } : item)),
      );
      queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], (prev) =>
        prev ? { ...prev, title } : prev,
      );

      dispatchUi({ type: 'RENAME_CLOSE' });
    },
    onError: () => {
      setErrorMessage('이름을 변경하지 못했습니다.');
    },
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
      setErrorMessage('');

      // 삭제 후 목록 재조회(백엔드 정렬 신뢰)
      const { data } = await conversationsQuery.refetch();
      const nextList = Array.isArray(data) ? data : [];

      setActiveConversationId(nextList[0]?.conversationId ?? null);

      dispatchUi({ type: 'DELETE_CLOSE' });
    },
    onError: () => {
      setErrorMessage('대화방 삭제에 실패했습니다.');
    },
  });

  /* ===========================
   * Handlers
   * =========================== */

  /** 새 채팅 생성 */
  const handleCreateNewChat = () => {
    if (createConversationMutation.isPending) return;
    createConversationMutation.mutate();
  };

  /** 메시지 전송(Enter/Send 버튼) */
  const handleSendMessage = () => {
    if (!activeConversationId || !messageInput.trim() || sendMessageMutation.isPending) return;

    const messageText = messageInput.trim();
    const localMessageId = `local-${Date.now()}`;

    // 마지막 서버 메시지 ID를 parentMessageId로 사용
    const lastServerMessageId = [...messages]
      .map((message) => message?.messageId)
      .filter((value) => typeof value === 'number')
      .pop();

    sendMessageMutation.mutate({
      conversationId: activeConversationId,
      messageText,
      localMessageId,
      parentMessageId: lastServerMessageId,
    });
  };

  /** Quick action: 입력창 채우기 */
  const handleQuickAction = (label) => {
    setMessageInput(label);
    inputRef.current?.focus();
  };

  /** rename 다이얼로그 열기(대상 ID + 기본 제목 세팅) */
  const openRenameDialog = (conversationId) => {
    const fallbackTitle = conversations.find(
      (item) => item.conversationId === conversationId,
    )?.title;

    //const cachedDetail = queryClient.getQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT]) ?? null;
    //const defaultTitle = cachedDetail?.title ?? fallbackTitle ?? 'New chat';

    const defaultTitle = cachedDetail?.title ?? 'New chat';

    dispatchUi({
      type: 'RENAME_OPEN',
      conversationId,
      title: defaultTitle,
    });
  };

  /** rename 저장 */
  const handleRenameSave = () => {
    if (ui.mode !== 'rename' || !ui.targetConversationId) return;
    if (renameConversationMutation.isPending) return;

    renameConversationMutation.mutate({
      conversationId: ui.targetConversationId,
      title: ui.renameTitle.trim() || 'New chat',
    });
  };

  /** delete 다이얼로그 열기 */
  const openDeleteDialog = (conversationId) => {
    dispatchUi({ type: 'DELETE_OPEN', conversationId });
  };

  /** delete 확정 */
  const handleDeleteConfirm = () => {
    if (ui.mode !== 'delete' || !ui.targetConversationId) return;
    if (deleteConversationMutation.isPending) return;

    deleteConversationMutation.mutate({ conversationId: ui.targetConversationId });
  };

  /* ===========================
   * Effects
   * =========================== */

  /** 최초 로딩 시 activeConversationId 자동 선택 */
  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].conversationId);
    }
  }, [activeConversationId, conversations]);

  /** 메시지 변화 시 스크롤 하단 + 포커스 */
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [messages.length, sendMessageMutation.isPending]);

  /** 메뉴 오픈 상태에서 바깥 클릭하면 닫기 */
  useEffect(() => {
    if (!ui.openedMenuConversationId) return;

    const handleOutsideClick = (event) => {
      const menuRoot = document.querySelector(`[data-menu-id="${ui.openedMenuConversationId}"]`);
      if (!menuRoot) {
        dispatchUi({ type: 'MENU_CLOSE' });
        return;
      }
      if (!menuRoot.contains(event.target)) {
        dispatchUi({ type: 'MENU_CLOSE' });
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [ui.openedMenuConversationId]);

  /** rename 모달이 열리면 인풋 자동 포커스/선택 */
  useEffect(() => {
    if (ui.mode !== 'rename') return;
    const input = renameInputRef.current;
    if (!input) return;

    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }, [ui.mode]);

  /* ===========================
   * Render
   * =========================== */

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#f9f2e7_0%,#f2e4d2_45%,#e9d2b8_100%)] text-clay">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@300;500;700&family=Space+Grotesk:wght@400;600&display=swap');
        @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes fadeUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="pointer-events-none absolute bottom-10 left-10 h-52 w-52 rounded-full bg-blush/40 blur-3xl animate-[floaty_14s_ease-in-out_infinite]" />

      <div className="relative mx-auto flex max-h-[800px] max-w-6xl flex-col gap-16 p-4 md:flex-row md:gap-4 md:p-4">
        <aside className="w-full rounded-3xl border border-sand/60 bg-white/75 p-5 shadow-[0_25px_80px_-60px_rgba(91,70,54,0.55)] backdrop-blur md:w-72">
          <div className="flex items-center justify-between">
            <h1 className="font-[Newsreader] text-2xl font-semibold tracking-tight">Heyso AI</h1>
            <span className="rounded-full bg-moss/20 px-2 py-1 text-xs font-semibold text-moss">
              Beta
            </span>
          </div>

          <button
            className="mt-5 w-full rounded-2xl bg-amber px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber/30 transition hover:translate-y-[-1px] hover:shadow-amber/40"
            onClick={handleCreateNewChat}
          >
            New chat
          </button>

          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-clay/50">
              <span>대화방 목록</span>
              <span className="rounded-full bg-sand/70 px-2 py-1 text-[10px] font-semibold text-clay/70">
                {conversations.length}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              {conversationsQuery.isLoading && (
                <div className="rounded-2xl border border-sand/50 bg-white/80 px-3 py-3 text-clay/60">
                  Loading...
                </div>
              )}

              {!conversationsQuery.isLoading && conversations.length === 0 && (
                <div className="rounded-2xl border border-sand/50 bg-white/80 px-3 py-3 text-clay/60">
                  No conversations yet.
                </div>
              )}

              {conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  className={`relative w-full rounded-2xl border px-3 py-3 text-left font-medium transition ${
                    conversation.conversationId === activeConversationId
                      ? 'border-amber/70 bg-amber/10 text-clay'
                      : 'border-transparent bg-white/60 text-clay/80 hover:border-sand/80 hover:bg-white'
                  }`}
                  onClick={() => setActiveConversationId(conversation.conversationId)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <span className="block truncate">{conversation.title || 'New chat'}</span>
                      <span className="mt-1 block text-xs text-clay/50">
                        {formatRelativeTime(conversation.updatedAt || conversation.createdAt)}
                      </span>
                    </div>

                    <div className="relative" data-menu-id={conversation.conversationId}>
                      <button
                        type="button"
                        className="flex h-8 w-8 items-center justify-center"
                        onClick={(event) => {
                          event.stopPropagation();
                          dispatchUi({
                            type: 'MENU_TOGGLE',
                            conversationId: conversation.conversationId,
                          });
                        }}
                      >
                        <EllipsisVertical />
                      </button>

                      {ui.openedMenuConversationId === conversation.conversationId && (
                        <div className="absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-2xl border border-sand/60 bg-white/95 text-xs text-clay/70 shadow-lg">
                          <button
                            type="button"
                            className="block w-full px-4 py-3 text-left transition hover:bg-amber/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              dispatchUi({ type: 'MENU_CLOSE' });
                            }}
                          >
                            공유하기
                          </button>

                          <button
                            type="button"
                            className="block w-full px-4 py-3 text-left transition hover:bg-amber/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              openRenameDialog(conversation.conversationId);
                            }}
                          >
                            이름바꾸기
                          </button>

                          <button
                            type="button"
                            className="block w-full px-4 py-3 text-left text-blush transition hover:bg-blush/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              openDeleteDialog(conversation.conversationId);
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-sand/60 bg-white/80 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/50">
              Quick actions
            </p>
            <div className="mt-3 grid gap-2 text-sm">
              {['Tone polish', 'Mood check', 'Idea spark'].map((label) => (
                <button
                  key={label}
                  className="rounded-xl border border-sand/50 bg-white/90 px-3 py-2 text-clay/80 transition hover:bg-amber/10"
                  onClick={() => handleQuickAction(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="relative flex min-h-[850px] max-h-[850px] w-full flex-1 flex-col overflow-hidden rounded-3xl border border-sand/60 bg-white/80 shadow-[0_40px_120px_-80px_rgba(91,70,54,0.8)] backdrop-blur">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sand/50 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/50">model</p>
              <div className="flex items-center gap-2">
                <span className="font-[Space_Grotesk] text-lg font-semibold">
                  {activeConversation?.model || 'Dialogue Muse'}
                </span>
                <span className="rounded-full border border-sand/70 px-2 py-1 text-xs text-clay/60">
                  active
                </span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="rounded-full border border-sand/60 bg-white/70 px-4 py-2 text-xs font-semibold text-clay/70 transition hover:bg-white">
                Share
              </button>
              <div className="flex items-center gap-3 rounded-full border border-sand/60 bg-white/80 px-3 py-2 text-xs font-semibold text-clay/70">
                <span className="h-8 w-8 rounded-full bg-gradient-to-br from-amber to-blush" />
                maker
              </div>
            </div>
          </header>

          {summary?.summary && (
            <div className="border-b border-sand/50 px-6 py-4 text-sm text-clay/70">
              <div className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/50">
                Summary
              </div>
              <p className="mt-2">{summary.summary}</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {errorMessage && (
                <div className="animate-[fadeUp_700ms_ease-out] rounded-3xl bg-blush/30 px-5 py-4 text-sm text-clay/80">
                  {errorMessage}
                </div>
              )}

              {conversationDetailQuery.isLoading && (
                <div className="animate-[fadeUp_700ms_ease-out] rounded-3xl bg-sand/30 px-5 py-4 text-sm text-clay/70">
                  Loading conversation...
                </div>
              )}

              {!conversationDetailQuery.isLoading && messages.length === 0 && (
                <div className="animate-[fadeUp_700ms_ease-out] rounded-3xl bg-sand/30 px-5 py-4 text-sm text-clay/70">
                  No messages yet. Start a new chat or send a note below.
                </div>
              )}

              {messages.map((message, index) => {
                const role = (message.role || '').toUpperCase();
                const key = message.messageId ?? message.id ?? index;

                if (role === 'USER') {
                  return (
                    <div key={key} className="flex justify-end">
                      <div className="animate-[fadeUp_800ms_ease-out] rounded-3xl bg-amber px-5 py-4 text-sm text-white shadow-lg shadow-amber/20">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex">
                    <div className="animate-[fadeUp_900ms_ease-out] rounded-3xl border border-sand/60 bg-white/90 px-5 py-4 text-sm text-clay/80">
                      {message.content || '...'}
                    </div>
                  </div>
                );
              })}

              <div ref={messageEndRef} />
            </div>
          </div>

          <footer className="sticky bottom-0 z-10 border-t border-sand/60 bg-white/90 px-6 py-5 backdrop-blur-sm">
            <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-sand/70 bg-white/90 px-4 py-3 shadow-inner">
              <span className="hidden h-10 w-10 rounded-xl bg-gradient-to-br from-moss/30 to-amber/40 md:block" />
              <textarea
                ref={inputRef}
                className="flex-1 resize-none bg-transparent text-sm text-clay/80 placeholder:text-clay/40 focus:outline-none"
                placeholder="Message Heyso AI..."
                rows={1}
                value={messageInput}
                onChange={(event) => setMessageInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <button
                className="rounded-xl bg-clay px-4 py-2 text-xs font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending}
              >
                {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-clay/50">
              Responses can be inaccurate. Review with care.
            </p>
          </footer>
        </main>
      </div>

      {/* ===========================
       * Rename Dialog
       * =========================== */}
      <Dialog.Root
        open={ui.mode === 'rename'}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) dispatchUi({ type: 'RENAME_CLOSE' });
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/60 bg-white/95 p-4 shadow-xl">
            <Dialog.Title className="sr-only">Rename conversation</Dialog.Title>
            <div className="flex items-center gap-2">
              <input
                ref={renameInputRef}
                className="flex-1 rounded-xl border border-sand/70 bg-white/90 px-3 py-2 text-sm text-clay/80 focus:outline-none focus:ring-2 focus:ring-amber/40"
                value={ui.renameTitle}
                onChange={(event) =>
                  dispatchUi({ type: 'RENAME_CHANGE', value: event.target.value })
                }
              />
              <button
                type="button"
                className="rounded-xl bg-clay px-3 py-2 text-xs font-semibold text-white transition hover:bg-clay/90"
                onClick={handleRenameSave}
              >
                저장
              </button>
              <button
                type="button"
                className="rounded-xl border border-sand/70 bg-white/80 px-3 py-2 text-xs font-semibold text-clay/70 transition hover:bg-white"
                onClick={() => dispatchUi({ type: 'RENAME_CLOSE' })}
              >
                취소
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* ===========================
       * Delete Confirm Dialog
       * =========================== */}
      <ConfirmDialog
        open={ui.mode === 'delete'}
        onOpenChange={(open) => {
          if (!open) dispatchUi({ type: 'DELETE_CLOSE' });
        }}
        title="삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel="확인"
        cancelLabel="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={() => dispatchUi({ type: 'DELETE_CLOSE' })}
      />
    </div>
  );
};

export default AiChatMain;
