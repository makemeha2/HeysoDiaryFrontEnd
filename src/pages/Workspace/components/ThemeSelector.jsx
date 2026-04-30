import { Palette } from 'lucide-react';

import { useTheme } from '@/contexts/ThemeContext.jsx';

const ThemeSelector = () => {
  const { themeId, themes, setThemeId } = useTheme();

  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/70 px-3 py-2 text-sm text-clay shadow-sm">
      <Palette className="h-4 w-4 text-amber" />
      <select
        className="bg-transparent text-sm font-medium outline-none"
        value={themeId}
        onChange={(event) => setThemeId(event.target.value)}
        aria-label="테마 선택"
      >
        {themes.map((theme) => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </label>
  );
};

export default ThemeSelector;

