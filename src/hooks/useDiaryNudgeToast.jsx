import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { authFetch } from '@lib/apiClient.js';

// localStorage keys
const TOAST_LAST_SHOWN_KEY = 'diaryToast:lastShownDate';
const TOAST_DISMISSED_KEY = 'diaryToast:dismissedDate';

const DEFAULT_MESSAGES = ['특별했던 오늘의 순간들을 남겨볼까요?'];

const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

const ls = {
  get(key) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
};

export function useDiaryNudgeToast({
  enabled,
  todayKey,
  delayMs = 10_000,
  pathname,
  onGoWrite, // () => void
  ToastComponent, // (props) => JSX
}) {
  const [messageText, setMessageText] = useState(null);

  const shouldShow = useCallback(() => {
    if (!enabled) return false;

    // 로컬 개발에서는 테스트 편의상 localStorage 체크 스킵 가능
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

  // 1) 로그인 직후 메시지 미리 가져오기(프리페치)
  useEffect(() => {
    if (!enabled) return;

    const ac = new AbortController();

    (async () => {
      try {
        const res = await authFetch('/api/diary/diary-nudge/today', {
          method: 'POST',
          signal: ac.signal,
        });

        if (!res?.ok) throw new Error(`status=${res?.status}`);

        // 네 apiClient 형태에 맞춰 접근 (res.data가 있다고 가정)
        const text = res?.data?.messageText;
        if (typeof text === 'string' && text.trim()) {
          setMessageText(text.trim());
        } else {
          // 빈 값이면 fallback을 쓰게 둠
          setMessageText(null);
        }
      } catch (e) {
        if (!ac.signal.aborted) {
          // 실패는 UX에 영향 없게
          setMessageText(null);
        }
      }
    })();

    return () => ac.abort();
  }, [enabled]);

  const finalMessage = useMemo(() => messageText ?? pickRandom(DEFAULT_MESSAGES), [messageText]);

  // 2) delayMs 이후 토스트 표시
  useEffect(() => {
    if (!enabled) return;
    if (pathname === '/login') return;
    if (!shouldShow()) return;

    const timer = setTimeout(() => {
      // 시간 경과 후에도 조건 재확인 (예: 사용자가 중간에 dismiss했을 수도)
      if (pathname === '/login') return;
      if (!shouldShow()) return;

      markShownToday();

      toast.custom((t) => (
        <ToastComponent
          message={finalMessage}
          onDismissToday={() => dismissToday()}
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
