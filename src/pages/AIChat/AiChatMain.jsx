import { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import * as Dialog from '@radix-ui/react-dialog';
import { EllipsisVertical } from 'lucide-react';

import ConfirmDialog from '@components/ConfirmDialog.jsx';

import useConversationUi from './hooks/useConversationUi.js';
import useAiChatData from './hooks/useAiChatData.js';
import ChatPanel from './components/ChatPanel.jsx';

import { cn } from '@lib/cn';

dayjs.extend(relativeTime);

const styles = {
  page: {
    root: 'relative min-h-screen bg-[radial-gradient(circle_at_top,#f9f2e7_0%,#f2e4d2_45%,#e9d2b8_100%)] text-clay',
    globalStyle: `
      @import url('https://fonts.googleapis.com/css2?family=Newsreader:wght@300;500;700&family=Space+Grotesk:wght@400;600&display=swap');
      @keyframes floaty { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
      @keyframes fadeUp { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
    `,
    glow: 'pointer-events-none absolute bottom-10 left-10 h-52 w-52 rounded-full bg-blush/40 blur-3xl animate-[floaty_14s_ease-in-out_infinite]',
    layout:
      'relative mx-auto flex max-h-[800px] max-w-6xl flex-col gap-16 p-4 md:flex-row md:gap-4 md:p-4',
  },

  sidebar: {
    root: 'w-full rounded-3xl border border-sand/60 bg-white/75 p-5 shadow-[0_25px_80px_-60px_rgba(91,70,54,0.55)] backdrop-blur md:w-72',
    header: 'flex items-center justify-between',
    title: 'font-[Newsreader] text-2xl font-semibold tracking-tight',
    badge: 'rounded-full bg-moss/20 px-2 py-1 text-xs font-semibold text-moss',

    newChatBtn:
      'mt-5 w-full rounded-2xl bg-amber px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-amber/30 transition hover:translate-y-[-1px] hover:shadow-amber/40',

    section: {
      root: 'mt-6',
      header:
        'mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-clay/50',
      count: 'rounded-full bg-sand/70 px-2 py-1 text-[10px] font-semibold text-clay/70',
      list: 'space-y-2 text-sm',
      emptyBox: 'rounded-2xl border border-sand/50 bg-white/80 px-3 py-3 text-clay/60',
    },

    convoItem: {
      btnBase: 'relative w-full rounded-2xl border px-3 py-3 text-left font-medium transition',
      btnActive: 'border-amber/70 bg-amber/10 text-clay',
      btnIdle: 'border-transparent bg-white/60 text-clay/80 hover:border-sand/80 hover:bg-white',

      row: 'flex items-start justify-between gap-2',
      meta: 'min-w-0',
      title: 'block truncate',
      time: 'mt-1 block text-xs text-clay/50',

      menu: {
        root: 'relative',
        btn: 'flex h-8 w-8 items-center justify-center',
        panel:
          'absolute right-0 top-10 z-10 w-36 overflow-hidden rounded-2xl border border-sand/60 bg-white/95 text-xs text-clay/70 shadow-lg',
        item: 'block w-full px-4 py-3 text-left transition hover:bg-amber/10',
        danger: 'block w-full px-4 py-3 text-left text-blush transition hover:bg-blush/10',
      },
    },

    quick: {
      root: 'mt-6 rounded-2xl border border-sand/60 bg-white/80 p-4',
      title: 'text-xs font-semibold uppercase tracking-[0.2em] text-clay/50',
      grid: 'mt-3 grid gap-2 text-sm',
      btn: 'rounded-xl border border-sand/50 bg-white/90 px-3 py-2 text-clay/80 transition hover:bg-amber/10',
    },
  },

  dialog: {
    overlay: 'fixed inset-0 z-50 bg-black/30 backdrop-blur-sm',
    content:
      'fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-sand/60 bg-white/95 p-4 shadow-xl',
    row: 'flex items-center gap-2',
    input:
      'flex-1 rounded-xl border border-sand/70 bg-white/90 px-3 py-2 text-sm text-clay/80 focus:outline-none focus:ring-2 focus:ring-amber/40',
    btnPrimary:
      'rounded-xl bg-clay px-3 py-2 text-xs font-semibold text-white transition hover:bg-clay/90',
    btnSecondary:
      'rounded-xl border border-sand/70 bg-white/80 px-3 py-2 text-xs font-semibold text-clay/70 transition hover:bg-white',
  },
};

const AiChatMain = () => {
  /* ===========================
   * State (page-level)
   * =========================== */
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  /* ===========================
   * Hooks
   * =========================== */
  const {
    ui,
    toggleMenu,
    closeMenu,
    openRename,
    changeRenameTitle,
    closeRename,
    openDelete,
    closeDelete,
    resetUi,
  } = useConversationUi();

  const {
    conversations,
    activeConversation,
    messages,
    summary,

    conversationsQuery,
    conversationDetailQuery,

    createConversationMutation,
    sendMessageMutation,
    renameConversationMutation,
    deleteConversationMutation,

    createNewChat,
    sendMessage,
    renameConversation,
    deleteConversation,
  } = useAiChatData({
    activeConversationId,
    setActiveConversationId,
    setErrorMessage,
    setMessageInput,
  });

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
   * Handlers
   * =========================== */

  /** 새 채팅 생성 */
  const handleCreateNewChat = () => {
    if (createConversationMutation.isPending) return;
    createNewChat();
    resetUi();
  };

  /** 메시지 전송(Enter/Send 버튼) */
  const handleSendMessage = () => {
    if (!activeConversationId || !messageInput.trim() || sendMessageMutation.isPending) return;
    sendMessage({ conversationId: activeConversationId, messageText: messageInput.trim() });
  };

  /** Quick action: 입력창 채우기 */
  const handleQuickAction = (label) => {
    setMessageInput(label);
    inputRef.current?.focus();
  };

  /** rename 다이얼로그 열기 */
  const openRenameDialog = (conversationId) => {
    const fallbackTitle = conversations.find((c) => c.conversationId === conversationId)?.title;
    openRename(conversationId, fallbackTitle ?? 'New chat');
  };

  /** rename 저장 */
  const handleRenameSave = () => {
    if (ui.mode !== 'rename' || !ui.targetConversationId) return;
    if (renameConversationMutation.isPending) return;

    renameConversation({
      conversationId: ui.targetConversationId,
      title: ui.renameTitle.trim() || 'New chat',
    });

    closeRename();
  };

  /** delete 다이얼로그 열기 */
  const openDeleteDialog = (conversationId) => {
    openDelete(conversationId);
  };

  /** delete 확정 */
  const handleDeleteConfirm = () => {
    if (ui.mode !== 'delete' || !ui.targetConversationId) return;
    if (deleteConversationMutation.isPending) return;

    deleteConversation({ conversationId: ui.targetConversationId });
    closeDelete();
  };

  /* ===========================
   * Effects
   * =========================== */

  /** 최초 로딩 시 activeConversationId 자동 선택(백엔드 정렬 신뢰) */
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
      if (!menuRoot || !menuRoot.contains(event.target)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [ui.openedMenuConversationId, closeMenu]);

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

  return (
    <div className={styles.page.root}>
      <style>{styles.page.globalStyle}</style>

      <div className={styles.page.glow} />

      <div className={styles.page.layout}>
        {/* Left Sidebar */}
        <aside className={styles.sidebar.root}>
          <div className={styles.sidebar.header}>
            <h1 className={styles.sidebar.title}>Heyso AI</h1>
            <span className={styles.sidebar.badge}>Beta</span>
          </div>

          <button className={styles.sidebar.newChatBtn} onClick={handleCreateNewChat}>
            New chat
          </button>

          <div className={styles.sidebar.section.root}>
            <div className={styles.sidebar.section.header}>
              <span>대화방 목록</span>
              <span className={styles.sidebar.section.count}>{conversations.length}</span>
            </div>

            <div className={styles.sidebar.section.list}>
              {conversationsQuery.isLoading && (
                <div className={styles.sidebar.section.emptyBox}>Loading...</div>
              )}

              {!conversationsQuery.isLoading && conversations.length === 0 && (
                <div className={styles.sidebar.section.emptyBox}>No conversations yet.</div>
              )}

              {conversations.map((conversation) => (
                <button
                  key={conversation.conversationId}
                  className={cn(
                    styles.sidebar.convoItem.btnBase,
                    conversation.conversationId === activeConversationId
                      ? styles.sidebar.convoItem.btnActive
                      : styles.sidebar.convoItem.btnIdle,
                  )}
                  onClick={() => setActiveConversationId(conversation.conversationId)}
                >
                  <div className={styles.sidebar.convoItem.row}>
                    <div className={styles.sidebar.convoItem.meta}>
                      <span className={styles.sidebar.convoItem.title}>
                        {conversation.title || 'New chat'}
                      </span>
                      <span className={styles.sidebar.convoItem.time}>
                        {formatRelativeTime(conversation.updatedAt || conversation.createdAt)}
                      </span>
                    </div>

                    <div
                      className={styles.sidebar.convoItem.menu.root}
                      data-menu-id={conversation.conversationId}
                    >
                      <button
                        type="button"
                        className={styles.sidebar.convoItem.menu.btn}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleMenu(conversation.conversationId);
                        }}
                      >
                        <EllipsisVertical />
                      </button>

                      {ui.openedMenuConversationId === conversation.conversationId && (
                        <div className={styles.sidebar.convoItem.menu.panel}>
                          <button
                            type="button"
                            className={styles.sidebar.convoItem.menu.item}
                            onClick={(event) => {
                              event.stopPropagation();
                              closeMenu();
                            }}
                          >
                            공유하기
                          </button>

                          <button
                            type="button"
                            className={styles.sidebar.convoItem.menu.item}
                            onClick={(event) => {
                              event.stopPropagation();
                              openRenameDialog(conversation.conversationId);
                            }}
                          >
                            이름바꾸기
                          </button>

                          <button
                            type="button"
                            className={styles.sidebar.convoItem.menu.danger}
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

          <div className={styles.sidebar.quick.root}>
            <p className={styles.sidebar.quick.title}>Quick actions</p>
            <div className={styles.sidebar.quick.grid}>
              {['Tone polish', 'Mood check', 'Idea spark'].map((label) => (
                <button
                  key={label}
                  className={styles.sidebar.quick.btn}
                  onClick={() => handleQuickAction(label)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Panel */}
        <ChatPanel
          activeConversation={activeConversation}
          summary={summary}
          messages={messages}
          isLoadingConversation={conversationDetailQuery.isLoading}
          errorMessage={errorMessage}
          messageInput={messageInput}
          setMessageInput={setMessageInput}
          onSendMessage={handleSendMessage}
          inputRef={inputRef}
          messageEndRef={messageEndRef}
          isSending={sendMessageMutation.isPending}
        />
      </div>

      {/* Rename Dialog */}
      <Dialog.Root
        open={ui.mode === 'rename'}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeRename();
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className={styles.dialog.overlay} />
          <Dialog.Content className={styles.dialog.content}>
            <Dialog.Title className="sr-only">Rename conversation</Dialog.Title>
            <div className={styles.dialog.row}>
              <input
                ref={renameInputRef}
                className={styles.dialog.input}
                value={ui.renameTitle}
                onChange={(event) => changeRenameTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleRenameSave();
                  }
                }}
              />
              <button className={styles.dialog.btnPrimary} type="button" onClick={handleRenameSave}>
                저장
              </button>
              <button className={styles.dialog.btnSecondary} type="button" onClick={closeRename}>
                취소
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        open={ui.mode === 'delete'}
        onOpenChange={(open) => {
          if (!open) closeDelete();
        }}
        title="삭제하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel="확인"
        cancelLabel="취소"
        onConfirm={handleDeleteConfirm}
        onCancel={closeDelete}
      />
    </div>
  );
};

export default AiChatMain;
