import { useCallback, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { Sparkles, X } from 'lucide-react';
import AiCommentPanel from './AiCommentPanel';

type RightPanelMode = 'hidden' | 'ai-comment';

type Props = {
  mode: RightPanelMode;
  diaryId: number | null;
  onClose: () => void;
};

const MODE_ICONS: Record<Exclude<RightPanelMode, 'hidden'>, React.ReactNode> = {
  'ai-comment': <Sparkles className="h-3.5 w-3.5" />,
};

const MODE_LABELS: Record<Exclude<RightPanelMode, 'hidden'>, string> = {
  'ai-comment': 'AI 코멘트',
};

const RightPanel = ({ mode, diaryId, onClose }: Props) => {
  const [panelWidth, setPanelWidth] = useState(320);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const isVisible = mode !== 'hidden';

  const onMouseDown = useCallback(
    (event: React.MouseEvent) => {
      isDragging.current = true;
      startX.current = event.clientX;
      startWidth.current = panelWidth;
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';

      const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isDragging.current) return;
        const diff = startX.current - moveEvent.clientX;
        const nextWidth = Math.max(280, Math.min(520, startWidth.current + diff));
        setPanelWidth(nextWidth);
      };

      const onMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [panelWidth]
  );

  if (!isVisible) return null;

  const containerStyle = { '--rp-width': `${panelWidth}px` } as CSSProperties;

  return (
    <div
      className="flex h-[50vh] w-full flex-shrink-0 overflow-hidden transition-all duration-300 ease-in-out md:h-full md:w-[var(--rp-width)]"
      style={containerStyle}
    >
      <div
        onMouseDown={onMouseDown}
        className="relative hidden w-1 flex-shrink-0 cursor-col-resize bg-border/60 transition-colors hover:bg-primary/40 md:block"
        role="separator"
        aria-label="패널 크기 조절"
      >
        <div className="absolute inset-y-0 -left-1 -right-1" />
      </div>

      <aside className="flex min-w-0 flex-1 flex-col overflow-hidden border-t border-border/60 bg-surface md:border-l md:border-t-0 md:border-border/40">
        <header className="flex flex-shrink-0 items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-xs font-medium text-foreground">
            {MODE_ICONS[mode]}
            {MODE_LABELS[mode]}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="패널 닫기"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-hidden py-3">
          {mode === 'ai-comment' ? <AiCommentPanel diaryId={diaryId} /> : null}
        </div>
      </aside>
    </div>
  );
};

export default RightPanel;
