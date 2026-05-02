import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type ThemeId =
  | 'warm-diary'
  | 'forest-note'
  | 'clear-morning'
  | 'rose-paper'
  | 'ink-focus'
  | 'notion-light';

const STORAGE_KEY = 'heyso-theme';
const DEFAULT_THEME: ThemeId = 'warm-diary';
const THEME_IDS: ThemeId[] = [
  'warm-diary',
  'forest-note',
  'clear-morning',
  'rose-paper',
  'ink-focus',
  'notion-light',
];

type ThemeContextValue = {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const readTheme = (): ThemeId => {
  if (typeof window === 'undefined') return DEFAULT_THEME;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return THEME_IDS.includes(stored as ThemeId) ? (stored as ThemeId) : DEFAULT_THEME;
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(() => readTheme());

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used within ThemeProvider');
  return value;
}
