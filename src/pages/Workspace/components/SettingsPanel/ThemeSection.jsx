import { Check } from 'lucide-react';

import { useTheme } from '@/contexts/ThemeContext.jsx';

const ThemeSection = () => {
  const { themeId, themes, setThemeId } = useTheme();

  return (
    <section className="rounded-2xl border border-sand/60 bg-white/70 p-5 shadow-soft">
      <h2 className="text-lg font-bold text-clay">테마</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {themes.map((theme) => (
          <button
            key={theme.id}
            type="button"
            className={`rounded-2xl border p-4 text-left ${
              themeId === theme.id ? 'border-amber bg-amber/10' : 'border-sand/60 bg-white/70'
            }`}
            onClick={() => setThemeId(theme.id)}
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="font-semibold text-clay">{theme.name}</span>
              {themeId === theme.id && <Check className="h-4 w-4 text-amber" />}
            </div>
            <div className="flex gap-2">
              {theme.preview.map((color) => (
                <span key={color} className="h-7 w-7 rounded-full border border-black/5" style={{ backgroundColor: color }} />
              ))}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};

export default ThemeSection;

