import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// ─── 타입 정의 ────────────────────────────────────────────────────────────────

export type ThemeId =
  | 'warm-diary'
  | 'notion-light'
  | 'calm-blue'
  | 'soft-green'
  | 'dark-diary';

export const THEME_IDS: ThemeId[] = [
  'warm-diary',
  'notion-light',
  'calm-blue',
  'soft-green',
  'dark-diary',
];

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'heyso-theme';
const DEFAULT_THEME: ThemeId = 'warm-diary';

// ─── 스토어 ───────────────────────────────────────────────────────────────────

type ThemeStore = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: DEFAULT_THEME,
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      // theme 필드만 localStorage에 저장
      partialize: (s) => ({ theme: s.theme }),
      version: 1,
      // 저장된 값이 유효하지 않은 ThemeId일 경우 기본값으로 복구
      migrate: (persisted: unknown, _version) => {
        const p = persisted as { theme?: unknown };
        if (!THEME_IDS.includes(p?.theme as ThemeId)) {
          return { theme: DEFAULT_THEME };
        }
        return p as { theme: ThemeId };
      },
    },
  ),
);
