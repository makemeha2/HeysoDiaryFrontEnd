import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { THEMES } from '@pages/Workspace/lib/themeCatalog.js';

const STORAGE_KEY = 'heyso-theme';
const DEFAULT_THEME = 'warm-diary';

const ThemeContext = createContext(null);

const isKnownTheme = (themeId) => THEMES.some((theme) => theme.id === themeId);

export const ThemeProvider = ({ children }) => {
  const [themeId, setThemeIdState] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return isKnownTheme(stored) ? stored : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = themeId;

    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      // localStorage may be unavailable in private browsing.
    }

    return () => {
      delete document.documentElement.dataset.theme;
    };
  }, [themeId]);

  const value = useMemo(
    () => ({
      themeId,
      themes: THEMES,
      setThemeId: (nextThemeId) => {
        if (isKnownTheme(nextThemeId)) {
          setThemeIdState(nextThemeId);
        }
      },
    }),
    [themeId],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const value = useContext(ThemeContext);
  if (!value) {
    throw new Error('useTheme must be used inside ThemeProvider');
  }
  return value;
};
