import { useEffect, useState } from 'react';

/**
 * 토스트 내부 UI
 * - AI 메시지
 * - "일기쓰기", "닫기"
 * - "오늘 하루 열지 않기" 체크박스
 */
const DiaryNudgeToast = ({ message, onGoWrite, onClose, onDismissToday }) => {
  const [dismissToday, setDismissToday] = useState(false);

  useEffect(() => {
    if (dismissToday) onDismissToday?.();
  }, [dismissToday, onDismissToday]);

  return (
    <div className="w-[360px] rounded-2xl border border-sand/50 bg-white/95 p-4 shadow-soft backdrop-blur">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-9 w-9 shrink-0 rounded-2xl bg-amber/20 flex items-center justify-center text-clay font-bold">
          AI
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-clay/90">Heyso Diary</p>
          <p className="mt-1 text-sm text-clay/80 leading-relaxed">{message}</p>

          <label className="mt-3 flex items-center gap-2 text-xs text-clay/60 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-sand/60 accent-[#d9b26a]"
              checked={dismissToday}
              onChange={(e) => setDismissToday(e.target.checked)}
            />
            오늘 하루 열지 않기
          </label>

          <div className="mt-3 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-sand/60 bg-white px-3 py-1.5 text-xs font-semibold text-clay/80 hover:bg-sand/20 active:opacity-90"
            >
              닫기
            </button>

            <button
              type="button"
              onClick={onGoWrite}
              className="rounded-full bg-amber px-3 py-1.5 text-xs font-semibold text-white hover:opacity-95 active:opacity-90"
            >
              일기쓰기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiaryNudgeToast;
