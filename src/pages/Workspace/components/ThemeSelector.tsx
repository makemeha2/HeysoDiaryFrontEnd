import { Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { themeCatalog } from '../lib/themeCatalog';

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card p-1">
      <Palette className="ml-2 h-4 w-4 text-muted-foreground" />
      {themeCatalog.map((item) => (
        <Button
          key={item.id}
          variant={theme === item.id ? 'secondary' : 'ghost'}
          size="icon"
          className="h-7 w-7"
          onClick={() => setTheme(item.id)}
          title={item.label}
          aria-label={item.label}
        >
          <span className="h-4 w-4 rounded-full border border-border" style={{ backgroundColor: item.swatch }} />
        </Button>
      ))}
    </div>
  );
}
