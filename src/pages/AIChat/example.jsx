import { useEffect, useMemo, useRef, useState } from 'react';

const AIChatExample = () => {
  const createId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const createConversation = (title = 'New chat') => {
    return {
      id: createId(),
      title,
      updatedAt: Date.now(),
      model: 'Dialogue Muse',
      mode: 'creative',
    };
  };

  const createMessage = (role, content, status) => {
    return {
      id: createId(),
      role,
      content,
      createdAt: Date.now(),
      status,
    };
  };

  const seedConversations = useMemo(() => {
    const base = [
      createConversation('Rewrite my daily reflection'),
      createConversation('Summarize the week'),
      createConversation('Plan a mindful morning'),
      createConversation('Draft a letter to me'),
    ];

    return base.map((conversation, index) => ({
      ...conversation,
      updatedAt: Date.now() - (index + 1) * 1000 * 60 * 90,
    }));
  }, []);

  const seedMessages = useMemo(() => {
    const now = Date.now();
    return {
      [seedConversations[0].id]: [
        {
          id: createId(),
          role: 'assistant',
          content: 'Good evening. Share a thought, and I will help you shape it into something you love to read.',
          createdAt: now - 1000 * 60 * 60 * 7,
        },
        {
          id: createId(),
          role: 'user',
          content: 'I felt restless today, but I still want to end on a softer note.',
          createdAt: now - 1000 * 60 * 60 * 7 + 1000 * 60 * 4,
        },
        {
          id: createId(),
          role: 'assistant',
          content:
            'Let us frame it as a transition: you felt the restlessness, named it, and chose to slow down. Would you like a short reflective paragraph or a poetic wrap-up?',
          createdAt: now - 1000 * 60 * 60 * 7 + 1000 * 60 * 5,
        },
      ],
      [seedConversations[1].id]: [
        {
          id: createId(),
          role: 'user',
          content: 'Can you summarize my week into a short reflection?',
          createdAt: now - 1000 * 60 * 60 * 4,
        },
        {
          id: createId(),
          role: 'assistant',
          content: 'Here is a gentle summary: you balanced obligations with small joys, and you are learning to listen to your energy.',
          createdAt: now - 1000 * 60 * 60 * 4 + 1000 * 60 * 3,
        },
      ],
      [seedConversations[2].id]: [
        {
          id: createId(),
          role: 'user',
          content: 'Help me plan a mindful morning routine for tomorrow.',
          createdAt: now - 1000 * 60 * 60 * 2,
        },
        {
          id: createId(),
          role: 'assistant',
          content: 'Start with a short stretch, then a cup of warm water, and a three-minute intention-setting note before checking your phone.',
          createdAt: now - 1000 * 60 * 60 * 2 + 1000 * 60 * 4,
        },
      ],
      [seedConversations[3].id]: [
        {
          id: createId(),
          role: 'assistant',
          content: 'Tell me the tone you want, and I will help draft a letter that sounds like you.',
          createdAt: now - 1000 * 60 * 60 * 1,
        },
      ],
    };
  }, [seedConversations]);

  const [conversations, setConversations] = useState(seedConversations);
  const [messagesByConversation, setMessagesByConversation] = useState(seedMessages);
  const [activeConversationId, setActiveConversationId] = useState(seedConversations[0]?.id);
  const [inputValue, setInputValue] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);

  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const streamingTimerRef = useRef(null);

  const activeConversation = conversations.find((item) => item.id === activeConversationId);
  const activeMessages = messagesByConversation[activeConversationId] ?? [];

  const sortedConversations = useMemo(() => {
    return [...conversations].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [conversations]);

  const formatTitle = (text) => {
    if (!text) return 'New chat';
    const trimmed = text.trim();
    if (trimmed.length <= 20) return trimmed;
    return `${trimmed.slice(0, 20)}...`;
  };

  const formatRelativeTime = (timestamp) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hr ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  const updateConversationMeta = (conversationId, updater) => {
    setConversations((prev) =>
      prev.map((item) => (item.id === conversationId ? updater(item) : item))
    );
  };

  const createNewChat = () => {
    const newConversation = createConversation();
    setConversations((prev) => [newConversation, ...prev]);
    setMessagesByConversation((prev) => ({ ...prev, [newConversation.id]: [] }));
    setActiveConversationId(newConversation.id);
    setInputValue('');
  };

  const startStreamingResponse = (conversationId, prompt) => {
    const responsePool = [
      `Got it. I will reshape "${prompt}" into a short, gentle reflection.`,
      `Let us soften the edges: name the feeling, accept it, then choose a calm next step.`,
      `Today reads like a pivot: pause, notice, then decide with care. Want it poetic or plain?`,
    ];
    const responseText = responsePool[Math.floor(Math.random() * responsePool.length)];
    const assistantMessage = createMessage('assistant', '', 'streaming');

    setMessagesByConversation((prev) => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] ?? []), assistantMessage],
    }));

    setIsStreaming(true);

    const duration = 1200 + Math.floor(Math.random() * 800);
    const intervalMs = Math.max(24, Math.floor(duration / responseText.length));
    let cursor = 0;

    streamingTimerRef.current = setInterval(() => {
      cursor += 1;
      setMessagesByConversation((prev) => {
        const list = prev[conversationId] ?? [];
        const nextList = list.map((message) => {
          if (message.id !== assistantMessage.id) return message;
          return {
            ...message,
            content: responseText.slice(0, cursor),
          };
        });
        return { ...prev, [conversationId]: nextList };
      });

      if (cursor >= responseText.length) {
        clearInterval(streamingTimerRef.current);
        streamingTimerRef.current = null;
        setMessagesByConversation((prev) => {
          const list = prev[conversationId] ?? [];
          const nextList = list.map((message) => {
            if (message.id !== assistantMessage.id) return message;
            return { ...message, content: responseText, status: 'done' };
          });
          return { ...prev, [conversationId]: nextList };
        });
        updateConversationMeta(conversationId, (item) => ({
          ...item,
          updatedAt: Date.now(),
        }));
        setIsStreaming(false);
      }
    }, intervalMs);
  };

  const sendMessage = () => {
    if (!activeConversationId || !inputValue.trim() || isStreaming) return;
    const messageText = inputValue.trim();
    const newMessage = createMessage('user', messageText);

    setMessagesByConversation((prev) => ({
      ...prev,
      [activeConversationId]: [...(prev[activeConversationId] ?? []), newMessage],
    }));

    updateConversationMeta(activeConversationId, (item) => ({
      ...item,
      title: item.title === 'New chat' ? formatTitle(messageText) : item.title,
      updatedAt: Date.now(),
    }));

    setInputValue('');
    startStreamingResponse(activeConversationId, messageText);
  };

  const handleQuickAction = (label) => {
    setInputValue(label);
    inputRef.current?.focus();
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConversationId, activeMessages.length, isStreaming]);

  useEffect(() => {
    return () => {
      if (streamingTimerRef.current) {
        clearInterval(streamingTimerRef.current);
      }
    };
  }, []);

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

      <div className="pointer-events-none absolute -top-20 right-10 h-64 w-64 rounded-full bg-amber/30 blur-3xl animate-[floaty_12s_ease-in-out_infinite]" />
      <div className="pointer-events-none absolute bottom-10 left-10 h-52 w-52 rounded-full bg-blush/40 blur-3xl animate-[floaty_14s_ease-in-out_infinite]" />

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-8">
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
              <span>History</span>
              <span className="rounded-full bg-sand/70 px-2 py-1 text-[10px] font-semibold text-clay/70">
                {conversations.length}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              {sortedConversations.map((conversation) => (
                <button
                  key={conversation.id}
                  className={`w-full rounded-2xl border px-3 py-3 text-left font-medium transition ${
                    conversation.id === activeConversationId
                      ? 'border-amber/70 bg-amber/10 text-clay'
                      : 'border-transparent bg-white/60 text-clay/80 hover:border-sand/80 hover:bg-white'
                  }`}
                  onClick={() => setActiveConversationId(conversation.id)}
                >
                  <span className="block truncate">{conversation.title}</span>
                  <span className="mt-1 block text-xs text-clay/50">
                    {formatRelativeTime(conversation.updatedAt)}
                  </span>
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

        <main className="flex min-h-[720px] w-full flex-1 flex-col overflow-hidden rounded-3xl border border-sand/60 bg-white/80 shadow-[0_40px_120px_-80px_rgba(91,70,54,0.8)] backdrop-blur">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-sand/50 px-6 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-clay/50">model</p>
              <div className="flex items-center gap-2">
                <span className="font-[Space_Grotesk] text-lg font-semibold">
                  {activeConversation?.model || 'Dialogue Muse'}
                </span>
                <span className="rounded-full border border-sand/70 px-2 py-1 text-xs text-clay/60">
                  {activeConversation?.mode || 'creative'}
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

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="mx-auto flex max-w-3xl flex-col gap-6">
              {activeMessages.length === 0 && (
                <div className="animate-[fadeUp_700ms_ease-out] rounded-3xl bg-sand/30 px-5 py-4 text-sm text-clay/70">
                  No messages yet. Start a new chat or send a note below.
                </div>
              )}

              {activeMessages.map((message) => {
                if (message.role === 'user') {
                  return (
                    <div key={message.id} className="flex justify-end">
                      <div className="animate-[fadeUp_800ms_ease-out] rounded-3xl bg-amber px-5 py-4 text-sm text-white shadow-lg shadow-amber/20">
                        {message.content}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={message.id} className="flex">
                    <div className="animate-[fadeUp_900ms_ease-out] rounded-3xl border border-sand/60 bg-white/90 px-5 py-4 text-sm text-clay/80">
                      {message.content || (message.status === 'streaming' ? '...' : '')}
                    </div>
                  </div>
                );
              })}

              <div className="grid gap-4 md:grid-cols-2">
                {[
                  '3-bullet gratitude recap',
                  'Soothing closing line',
                  'Gentle reframe',
                  'Tomorrow morning intention',
                ].map((chip) => (
                  <button
                    key={chip}
                    className="animate-[fadeUp_1s_ease-out] rounded-2xl border border-sand/60 bg-white/80 px-4 py-3 text-left text-sm text-clay/70 transition hover:border-amber/60 hover:bg-amber/10"
                    onClick={() => handleQuickAction(chip)}
                  >
                    {chip}
                  </button>
                ))}
              </div>
              <div ref={messageEndRef} />
            </div>
          </div>

          <footer className="border-t border-sand/60 px-6 py-5">
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
                disabled={isStreaming}
              >
                {isStreaming ? 'Sending...' : 'Send'}
              </button>
            </div>
            <p className="mt-3 text-center text-xs text-clay/50">
              Responses can be inaccurate. Review with care.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default AIChatExample;
