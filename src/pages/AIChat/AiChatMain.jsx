import { useEffect, useMemo, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as Dialog from '@radix-ui/react-dialog';
import { EllipsisVertical } from 'lucide-react';

import { authFetch } from '@lib/apiClient.js';
import ConfirmDialog from '@components/ConfirmDialog.jsx';

const DEFAULT_PAGE = 1;
const DEFAULT_SIZE = 100;
const MESSAGE_LIMIT = 100;

dayjs.extend(relativeTime);

const AiChatMain = () => {
  const queryClient = useQueryClient();

  // 대화 목록 상태
  // 선택된 대화 ID
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isRenameOpen, setIsRenameOpen] = useState(false);
  const [handleId, sethandleId] = useState(null); // 삭제, 이름변경 등에 사용되는 대화방ID
  const [renameValue, setRenameValue] = useState('');
  // 입력창 내용
  const [inputValue, setInputValue] = useState('');
  // 오류 메시지 표시용
  const [errorMessage, setErrorMessage] = useState('');

  const [deleteConversationsConfirmOpen, setDeleteConversationsConfirmOpen] = useState(false);

  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const renameInputRef = useRef(null);

  // 채팅방 목록 가져오기
  const conversationsQuery = useQuery({
    queryKey: ['aiChatConversations', DEFAULT_PAGE, DEFAULT_SIZE],
    staleTime: 0,
    queryFn: async ({ signal }) => {
      const res = await authFetch('/api/aichat/conversations', {
        method: 'GET',
        params: { page: DEFAULT_PAGE, size: DEFAULT_SIZE },
        signal,
      });
      if (!res.ok) throw new Error('Failed to load conversations');
      const list = res.data?.conversations;
      return Array.isArray(list) ? list : [];
    },
    onSuccess: () => {
      setErrorMessage('');
    },
    onError: () => {
      setErrorMessage('대화 목록을 불러오지 못했습니다.');
    },
  });

  // 채팅방 상세 및 이전 대화 가져오기
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

  // 요약정보 가져오기
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

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => {
      const left = new Date(a?.updatedAt || a?.createdAt || 0).getTime();
      const right = new Date(b?.updatedAt || b?.createdAt || 0).getTime();
      return right - left;
    });
  }, [conversations]);

  // 활성화된 대화방 정보
  const activeConversation =
    conversationDetail?.conversationId === activeConversationId
      ? conversationDetail
      : conversations.find((item) => item.conversationId === activeConversationId);

  const formatRelativeTime = (timestamp) => {
    if (!timestamp) return '';
    return dayjs(timestamp).fromNow();
  };

  // 새 대화방 만들기
  const createNewChatMutation = useMutation({
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
      setErrorMessage('');
    },
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
      setActiveConversationId(createdId);
      setInputValue('');
    },
    onError: () => {
      setErrorMessage('새 대화를 만들지 못했습니다.');
    },
  });

  // 메세지 보내기
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
      queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], nextDetail);
      setInputValue('');
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
      queryClient.setQueryData(['aiChatConversations', DEFAULT_PAGE, DEFAULT_SIZE], (prev = []) =>
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
      setErrorMessage('메시지를 전송하지 못했습니다.');
    },
  });

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
      queryClient.setQueryData(['aiChatConversations', DEFAULT_PAGE, DEFAULT_SIZE], (prev = []) =>
        prev.map((item) => (item.conversationId === conversationId ? { ...item, title } : item)),
      );
      queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], (prev) =>
        prev ? { ...prev, title } : prev,
      );
      setIsRenameOpen(false);
    },
    onError: () => {
      setErrorMessage('이름을 변경하지 못했습니다.');
    },
  });

  // 새채팅 버튼 누르기
  const createNewChat = () => {
    if (createNewChatMutation.isPending) return;
    createNewChatMutation.mutate();
  };

  // 메세지 보내기 버튼 누르기
  const sendMessage = () => {
    if (!activeConversationId || !inputValue.trim() || sendMessageMutation.isPending) return;
    const messageText = inputValue.trim();
    const localMessageId = `local-${Date.now()}`;
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

  const handleQuickAction = (label) => {
    setInputValue(label);
    inputRef.current?.focus();
  };

  useEffect(() => {
    if (!activeConversationId && sortedConversations.length > 0) {
      setActiveConversationId(sortedConversations[0].conversationId);
    }
  }, [activeConversationId, sortedConversations]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    inputRef.current?.focus();
  }, [messages.length, sendMessageMutation.isPending]);

  useEffect(() => {
    if (!openMenuId) return;

    const handleOutsideClick = (event) => {
      const menuRoot = document.querySelector(`[data-menu-id="${openMenuId}"]`);
      if (!menuRoot) {
        setOpenMenuId(null);
        return;
      }
      if (!menuRoot.contains(event.target)) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [openMenuId]);

  useEffect(() => {
    if (!isRenameOpen) return;
    const input = renameInputRef.current;
    if (!input) return;
    requestAnimationFrame(() => {
      input.focus();
      input.select();
    });
  }, [isRenameOpen]);

  // const fetchSummaryByConversationId = async (conversationId) => {
  //   if (!conversationId) return null;
  //   return queryClient.fetchQuery({
  //     queryKey: ['aiChatSummary', conversationId],
  //     staleTime: 0,
  //     queryFn: async () => {
  //       const res = await authFetch(`/api/aichat/conversations/${conversationId}/summary`, {
  //         method: 'GET',
  //       });
  //       if (!res.ok) return null;
  //       return res.data ?? null;
  //     },
  //   });
  // };

  const openRenameDialog = async (targetId) => {
    const targetConversationId = targetId ?? openMenuId ?? activeConversationId;

    const cachedSummary = queryClient.getQueryData(['aiChatConversation', targetConversationId]);
    const targetSummary =
      cachedSummary ??
      queryClient.getQueryData(['aiChatConversation', targetConversationId, MESSAGE_LIMIT]);

    const fallbackTitle = conversations.find(
      (item) => item.conversationId === targetConversationId,
    )?.title;
    const defaultTitle =
      targetSummary?.title ?? targetSummary?.conversationTitle ?? fallbackTitle ?? 'New chat';
    setRenameValue(defaultTitle);
    sethandleId(targetConversationId);
    setIsRenameOpen(true);
  };

  // 이름 바꾸기
  const handleRenameSave = () => {
    const targetConversationId = handleId ?? activeConversationId;

    if (!targetConversationId || renameConversationMutation.isPending) return;
    const nextTitle = renameValue.trim() || 'New chat';
    renameConversationMutation.mutate({
      conversationId: targetConversationId,
      title: nextTitle,
    });

    setOpenMenuId(null);
    sethandleId(null);
  };

  const openDeleteConversationsDialog = (targetId) => {
    console.log('openDeleteConversationsDialog.targetId', targetId);
    if (!targetId) return;

    sethandleId(targetId);
    setDeleteConversationsConfirmOpen(true);
  };

  // 삭제
  const handleDeleteConversationsConfirm = () => {
    console.log('handleDeleteConversationsConfirm.targetId', handleId);

    deleteConversationMutation.mutate({ conversationId: handleId });
    setDeleteConversationsConfirmOpen(false);
    sethandleId(null);
  };

  const deleteConversationMutation = useMutation({
    mutationFn: async ({ conversationId }) => {
      const res = await authFetch(`/api/aichat/conversations/${conversationId}/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to update conversation');
      return res.data ?? null;
    },
    onSuccess: (_data, { conversationId, title }) => {
      queryClient.setQueryData(['aiChatConversations', DEFAULT_PAGE, DEFAULT_SIZE], (prev = []) =>
        prev.map((item) => (item.conversationId === conversationId ? { ...item, title } : item)),
      );
      queryClient.setQueryData(['aiChatConversation', conversationId, MESSAGE_LIMIT], (prev) =>
        prev ? { ...prev, title } : prev,
      );
    },
    onError: () => {
      setErrorMessage('이름을 변경하지 못했습니다.');
    },
  });

  const handleDeleteConversationsCancel = () => {};

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top,#f9f2e7_0%,#f2e4d2_45%,#e9d2b8_100%)] text-clay">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@300;500;700&family=Space+Grotesk:wght@400;600&display=swap');
        @keyframes floaty {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes fadeUp {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
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
            onClick={createNewChat}
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
              {!conversationsQuery.isLoading && sortedConversations.length === 0 && (
                <div className="rounded-2xl border border-sand/50 bg-white/80 px-3 py-3 text-clay/60">
                  No conversations yet.
                </div>
              )}
              {sortedConversations.map((conversation) => (
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
                          setOpenMenuId((prev) =>
                            prev === conversation.conversationId
                              ? null
                              : conversation.conversationId,
                          );
                        }}
                      >
                        <EllipsisVertical />
                      </button>
                      {openMenuId === conversation.conversationId && (
                        <div className="absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-2xl border border-sand/60 bg-white/95 text-xs text-clay/70 shadow-lg">
                          <button
                            type="button"
                            className="block w-full px-4 py-3 text-left transition hover:bg-amber/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenuId(null);
                            }}
                          >
                            공유하기
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-3 text-left transition hover:bg-amber/10"
                            onClick={(event) => {
                              event.stopPropagation();
                              setOpenMenuId(null);
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
                              openDeleteConversationsDialog(conversation.conversationId);
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

              {/* <div className="grid gap-4 md:grid-cols-2">
                {['오늘의 날씨를 알려줘.', '오늘의 주요 뉴스는?'].map((chip) => (
                  <button
                    key={chip}
                    className="animate-[fadeUp_1s_ease-out] rounded-2xl border border-sand/60 bg-white/80 px-4 py-3 text-left text-sm text-clay/70 transition hover:border-amber/60 hover:bg-amber/10"
                    onClick={() => handleQuickAction(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div> */}
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
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <button
                className="rounded-xl bg-clay px-4 py-2 text-xs font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={sendMessage}
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

      {/* 이름 바꾸기 모달 팝업 */}
      <Dialog.Root
        open={isRenameOpen}
        onOpenChange={(nextOpen) => {
          setIsRenameOpen(nextOpen);
          if (!nextOpen) sethandleId(null);
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
                value={renameValue}
                onChange={(event) => setRenameValue(event.target.value)}
              />
              <button
                type="button"
                className="rounded-xl bg-clay px-3 py-2 text-xs font-semibold text-white transition hover:bg-clay/90"
                onClick={() => handleRenameSave()}
              >
                저장
              </button>
              <button
                type="button"
                className="rounded-xl border border-sand/70 bg-white/80 px-3 py-2 text-xs font-semibold text-clay/70 transition hover:bg-white"
                onClick={() => setIsRenameOpen(false)}
              >
                취소
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 삭제 다이얼로그 */}
      <ConfirmDialog
        open={deleteConversationsConfirmOpen}
        onOpenChange={setDeleteConversationsConfirmOpen}
        title="삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel="확인"
        cancelLabel="취소"
        onConfirm={handleDeleteConversationsConfirm}
        onCancel={handleDeleteConversationsCancel}
      />
    </div>
  );
};

export default AiChatMain;
