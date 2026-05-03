import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { toast } from 'sonner';

import { authFetch } from '../../../lib/apiClient';

const TOAST_LAST_SHOWN_KEY = 'diaryToast:lastShownDate';
const TOAST_DISMISSED_KEY = 'diaryToast:dismissedDate';

const DEFAULT_MESSAGES = ['특별했던 오늘의 순간들을 남겨볼까요?'];

type DiaryNudgeResponse = {
  messageText?: string;
};

type DiaryNudgeToastProps = {
  message: string;
  onDismissToday: () => void;
  onClose: () => void;
  onGoWrite: () => void;
};

type UseDiaryNudgeToastOptions = {
  enabled: boolean;
  todayKey: string;
  delayMs?: number;
  pathname?: string;
  onGoWrite?: () => void;
  ToastComponent: ComponentType<DiaryNudgeToastProps>;
};

const pickRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const ls = {
  get(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage access can fail in restricted browser contexts.
    }
  },
};

export function useDiaryNudgeToast({
  enabled,
  todayKey,
  delayMs = 10_000,
  pathname,
  onGoWrite,
  ToastComponent,
}: UseDiaryNudgeToastOptions) {
  const [messageText, setMessageText] = useState<string | null>(null);

  const shouldShow = useCallback(() => {
    if (!enabled) return false;

    const dismissed = ls.get(TOAST_DISMISSED_KEY);
    const lastShown = ls.get(TOAST_LAST_SHOWN_KEY);

    if (dismissed === todayKey) return false;
    if (lastShown === todayKey) return false;

    return true;
  }, [enabled, todayKey]);

  const dismissToday = useCallback(() => {
    ls.set(TOAST_DISMISSED_KEY, todayKey);
  }, [todayKey]);

  const markShownToday = useCallback(() => {
    ls.set(TOAST_LAST_SHOWN_KEY, todayKey);
  }, [todayKey]);

  useEffect(() => {
    if (!enabled) return;

    const ac = new AbortController();

    const fetchNudgeMessage = async () => {
      try {
        const res = await authFetch<DiaryNudgeResponse>('/api/diary/diary-nudge/today', {
          method: 'POST',
          signal: ac.signal,
        });

        if (!res.ok) throw new Error(`status=${res.status}`);

        const text = res.data.messageText;
        setMessageText(typeof text === 'string' && text.trim() ? text.trim() : null);
      } catch {
        if (!ac.signal.aborted) {
          setMessageText(null);
        }
      }
    };

    void fetchNudgeMessage();

    return () => ac.abort();
  }, [enabled]);

  const finalMessage = useMemo(() => messageText ?? pickRandom(DEFAULT_MESSAGES), [messageText]);

  useEffect(() => {
    if (!enabled) return;
    if (pathname === '/login') return;
    if (!shouldShow()) return;

    const timer = setTimeout(() => {
      if (pathname === '/login') return;
      if (!shouldShow()) return;

      markShownToday();

      toast.custom((t) => (
        <ToastComponent
          message={finalMessage}
          onDismissToday={dismissToday}
          onClose={() => toast.dismiss(t)}
          onGoWrite={() => {
            toast.dismiss(t);
            onGoWrite?.();
          }}
        />
      ));
    }, delayMs);

    return () => clearTimeout(timer);
  }, [
    enabled,
    pathname,
    delayMs,
    shouldShow,
    markShownToday,
    finalMessage,
    dismissToday,
    onGoWrite,
    ToastComponent,
  ]);
}
