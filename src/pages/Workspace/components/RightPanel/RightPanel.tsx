import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import AiCommentPanel from './AiCommentPanel';

type Props = {
  open: boolean;
  diaryId: number | null;
  onClose: () => void;
};

export default function RightPanel({ open, diaryId, onClose }: Props) {
  if (!open) return null;

  return (
    <>
      <aside className="hidden h-full w-80 shrink-0 border-l border-border bg-background lg:block">
        <AiCommentPanel diaryId={diaryId} />
      </aside>
      <div className="fixed inset-0 z-40 bg-black/35 lg:hidden" onClick={onClose}>
        <div
          className="absolute inset-x-0 bottom-0 h-[50vh] rounded-t-lg border border-border bg-background"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="absolute right-3 top-3 z-10">
            <Button variant="ghost" size="icon" onClick={onClose} aria-label="닫기">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <AiCommentPanel diaryId={diaryId} />
        </div>
      </div>
    </>
  );
}
