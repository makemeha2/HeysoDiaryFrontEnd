import { MessageSquareText, PenLine, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';

type Props = {
  isSaving: boolean;
  onSave: () => void;
  onOpenAi: () => void;
  onOpenPolish: () => void;
};

export default function BottomActionBar({ isSaving, onSave, onOpenAi, onOpenPolish }: Props) {
  return (
    <div className="sticky bottom-0 flex flex-wrap items-center justify-end gap-2 border-t border-border bg-background/95 py-3 backdrop-blur">
      <Button variant="outline" onClick={onOpenAi}>
        <MessageSquareText className="h-4 w-4" />
        AI 코멘트
      </Button>
      <Button variant="outline" onClick={onOpenPolish}>
        <PenLine className="h-4 w-4" />
        글 다듬기
      </Button>
      <Button onClick={onSave} disabled={isSaving}>
        <Save className="h-4 w-4" />
        {isSaving ? '저장 중' : '저장'}
      </Button>
    </div>
  );
}
