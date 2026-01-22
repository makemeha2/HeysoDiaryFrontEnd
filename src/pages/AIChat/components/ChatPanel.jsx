import MarkdownIt from 'markdown-it';
import { cn } from '@lib/cn';

const markdown = new MarkdownIt({ breaks: true, linkify: true });

/**
 * ChatPanel
 * - 우측 채팅 영역(헤더/요약/메시지/입력창)
 * - styles 네이밍 규칙 통일 + base 스타일 공통화
 */
const styles = {
  chat: {
    root: 'relative flex min-h-[850px] max-h-[850px] w-full flex-1 flex-col overflow-hidden rounded-3xl border border-sand/60 bg-white/80 shadow-[0_40px_120px_-80px_rgba(91,70,54,0.8)] backdrop-blur',

    header: {
      root: 'flex flex-wrap items-center justify-between gap-4 border-b border-sand/50 px-6 py-5',
      label: 'text-xs font-semibold uppercase tracking-[0.2em] text-clay/50',
      modelRow: 'flex items-center gap-2',
      modelName: 'font-[Space_Grotesk] text-lg font-semibold',
      pill: 'rounded-full border border-sand/70 px-2 py-1 text-xs text-clay/60',

      actions: {
        root: 'flex items-center gap-4',
        shareBtn:
          'rounded-full border border-sand/60 bg-white/70 px-4 py-2 text-xs font-semibold text-clay/70 transition hover:bg-white',
        maker:
          'flex items-center gap-3 rounded-full border border-sand/60 bg-white/80 px-3 py-2 text-xs font-semibold text-clay/70',
        avatar: 'h-8 w-8 rounded-full bg-gradient-to-br from-amber to-blush',
      },
    },

    summary: {
      root: 'border-b border-sand/50 px-6 py-4 text-sm text-clay/70',
      title: 'text-xs font-semibold uppercase tracking-[0.2em] text-clay/50',
      body: 'mt-2',
    },

    body: {
      root: 'flex-1 overflow-y-auto px-6 py-6',
      inner: 'mx-auto flex max-w-3xl flex-col gap-6',

      notice: {
        base: 'animate-[fadeUp_700ms_ease-out] rounded-3xl px-5 py-4 text-sm',
        error: 'bg-blush/30 text-clay/80',
        muted: 'bg-sand/30 text-clay/70',
      },

      row: {
        user: 'flex justify-end',
        assistant: 'flex',
      },

      bubble: {
        base: 'prose prose-sm max-w-none rounded-3xl px-5 py-4 text-sm',
        user:
          'animate-[fadeUp_800ms_ease-out] bg-amber text-white shadow-lg shadow-amber/20 prose-invert',
        assistant:
          'animate-[fadeUp_900ms_ease-out] border border-sand/60 bg-white/90 text-clay/80',
      },
    },

    footer: {
      root: 'sticky bottom-0 z-10 border-t border-sand/60 bg-white/90 px-6 py-5 backdrop-blur-sm',
      composer:
        'mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-sand/70 bg-white/90 px-4 py-3 shadow-inner',
      icon: 'hidden h-10 w-10 rounded-xl bg-gradient-to-br from-moss/30 to-amber/40 md:block',
      textarea:
        'flex-1 resize-none bg-transparent text-sm text-clay/80 placeholder:text-clay/40 focus:outline-none',
      sendBtn:
        'rounded-xl bg-clay px-4 py-2 text-xs font-semibold text-white transition hover:bg-clay/90 disabled:cursor-not-allowed disabled:opacity-60',
      hint: 'mt-3 text-center text-xs text-clay/50',
    },
  },
};

const ChatPanel = ({
  activeConversation,
  summary,
  messages,
  isLoadingConversation,
  errorMessage,
  messageInput,
  setMessageInput,
  onSendMessage,
  inputRef,
  messageEndRef,
  isSending,
}) => {
  return (
    <main className={styles.chat.root}>
      {/* Header */}
      <header className={styles.chat.header.root}>
        <div>
          <p className={styles.chat.header.label}>model</p>
          <div className={styles.chat.header.modelRow}>
            <span className={styles.chat.header.modelName}>
              {activeConversation?.model || 'Dialogue Muse'}
            </span>
            <span className={styles.chat.header.pill}>active</span>
          </div>
        </div>

        <div className={styles.chat.header.actions.root}>
          <button className={styles.chat.header.actions.shareBtn}>Share</button>
          <div className={styles.chat.header.actions.maker}>
            <span className={styles.chat.header.actions.avatar} />
            maker
          </div>
        </div>
      </header>

      {/* Summary */}
      {summary?.summary && (
        <section className={styles.chat.summary.root}>
          <div className={styles.chat.summary.title}>Summary</div>
          <p className={styles.chat.summary.body}>{summary.summary}</p>
        </section>
      )}

      {/* Body */}
      <div className={styles.chat.body.root}>
        <div className={styles.chat.body.inner}>
          {errorMessage && (
            <div className={cn(styles.chat.body.notice.base, styles.chat.body.notice.error)}>
              {errorMessage}
            </div>
          )}

          {isLoadingConversation && (
            <div className={cn(styles.chat.body.notice.base, styles.chat.body.notice.muted)}>
              Loading conversation...
            </div>
          )}

          {!isLoadingConversation && messages.length === 0 && (
            <div className={cn(styles.chat.body.notice.base, styles.chat.body.notice.muted)}>
              No messages yet. Start a new chat or send a note below.
            </div>
          )}

          {messages.map((message, index) => {
            const role = (message.role || '').toUpperCase();
            const key = message.messageId ?? message.id ?? index;
            const isUser = role === 'USER';
            const rawContent = message.content || (isUser ? '' : '...');
            const renderedContent = rawContent ? markdown.render(rawContent) : '';

            return (
              <div
                key={key}
                className={isUser ? styles.chat.body.row.user : styles.chat.body.row.assistant}
              >
                <div
                  className={cn(
                    styles.chat.body.bubble.base,
                    isUser ? styles.chat.body.bubble.user : styles.chat.body.bubble.assistant,
                  )}
                  dangerouslySetInnerHTML={{ __html: renderedContent }}
                />
              </div>
            );
          })}

          <div ref={messageEndRef} />
        </div>
      </div>

      {/* Footer */}
      <footer className={styles.chat.footer.root}>
        <div className={styles.chat.footer.composer}>
          <span className={styles.chat.footer.icon} />
          <textarea
            ref={inputRef}
            className={styles.chat.footer.textarea}
            placeholder="Message Heyso AI..."
            rows={1}
            value={messageInput}
            onChange={(event) => setMessageInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                onSendMessage();
              }
            }}
          />
          <button
            className={styles.chat.footer.sendBtn}
            onClick={onSendMessage}
            disabled={isSending}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>

        <p className={styles.chat.footer.hint}>Responses can be inaccurate. Review with care.</p>
      </footer>
    </main>
  );
};

export default ChatPanel;
