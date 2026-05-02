import { useEffect, useRef, useState } from 'react';
import { Check, Palette } from 'lucide-react';
import { useTheme, type ThemeId } from '@/contexts/ThemeContext';
import { themeCatalog } from '../lib/themeCatalog';

const themeTextColor: Record<ThemeId, string> = {
  'warm-diary': '#2C2420',
  'notion-light': '#1A1A1A',
  'calm-blue': '#1E2D3D',
  'soft-green': '#1C2E1E',
  'dark-diary': '#EDE8E0',
};

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={[
          'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
          open ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
        ].join(' ')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="테마 선택"
      >
        <Palette className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">테마</span>
      </button>

      {open ? (
        <div
          className="animate-in fade-in-0 slide-in-from-top-2 absolute right-0 top-9 z-50 min-w-[180px] rounded-lg border border-border bg-popover py-2 shadow-lg duration-150"
          role="listbox"
          aria-label="테마 목록"
        >
          <p className="mb-2 px-3 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">테마 선택</p>
          {themeCatalog.map((item) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={theme === item.id}
              onClick={() => {
                setTheme(item.id);
                setOpen(false);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <span
                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-border/60"
                style={{ background: item.swatch }}
              >
                {theme === item.id ? <Check className="h-2.5 w-2.5" style={{ color: themeTextColor[item.id] }} /> : null}
              </span>
              <span className={['text-xs', theme === item.id ? 'font-medium text-primary' : 'text-foreground'].join(' ')}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
