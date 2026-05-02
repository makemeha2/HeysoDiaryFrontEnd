import { Coins, Menu, Sparkles, Wand2 } from 'lucide-react';
import ThemeSelector from './ThemeSelector';
import { mockTokenUsage } from '../lib/mockData';

type Props = {
  viewMode: 'diary' | 'settings';
  rightPanelMode: 'hidden' | 'ai-comment';
  onToggleSidebar: () => void;
  onRequestPolish: () => void;
  onToggleAi: () => void;
};

type ActionButtonProps = {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
};

function ActionButton({ icon, label, active, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={[
        'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs transition-colors',
        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      ].join(' ')}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

function TokenDisplay() {
  return (
    <div className="flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1">
      <Coins className="h-3.5 w-3.5 text-primary" />
      <span className="text-[11px] text-muted-foreground">오늘의 토큰:</span>
      <span className="text-[11px] font-medium text-foreground">
        {mockTokenUsage.used}/{mockTokenUsage.limit}
      </span>
    </div>
  );
}

export default function TopActionBar({
  viewMode,
  rightPanelMode,
  onToggleSidebar,
  onRequestPolish,
  onToggleAi,
}: Props) {
  return (
    <header className="flex h-11 shrink-0 items-center justify-between border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted md:hidden"
          aria-label="사이드바 열기"
        >
          <Menu className="h-4 w-4" />
        </button>
        <span className="hidden text-xs text-muted-foreground sm:block">
          {viewMode === 'settings' ? '설정' : '오늘의 일기'}
        </span>
      </div>

      {viewMode === 'diary' ? (
        <div className="flex items-center gap-1">
          <TokenDisplay />
          <div className="mx-1 h-4 w-px bg-border/60" />
          <ActionButton icon={<Wand2 className="h-3.5 w-3.5" />} label="글 다듬기" onClick={onRequestPolish} />
          <ActionButton
            icon={<Sparkles className="h-3.5 w-3.5" />}
            label="AI 코멘트"
            active={rightPanelMode === 'ai-comment'}
            onClick={onToggleAi}
          />
          <div className="mx-0.5 h-4 w-px bg-border/60" />
          <ThemeSelector />
        </div>
      ) : (
        <div className="flex items-center">
          <ThemeSelector />
        </div>
      )}
    </header>
  );
}
