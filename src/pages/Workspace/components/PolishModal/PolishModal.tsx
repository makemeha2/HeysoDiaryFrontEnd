import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import useDiaryAiPolish from '../../hooks/useDiaryAiPolish';

type Props = {
  open: boolean;
  diaryId: number | null;
  source: string;
  onClose: () => void;
  onApply: (content: string) => void;
};

export default function PolishModal({ open, diaryId, source, onClose, onApply }: Props) {
  const [mode, setMode] = useState<'STRICT' | 'RELAXED'>('RELAXED');
  const { polishedContent, polishError, isPolishing, usageText, requestPolish, clearPolishResult } = useDiaryAiPolish();
  const tooShort = source.trim().length < 50;

  useEffect(() => {
    if (open) clearPolishResult();
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 grid max-h-[86vh] w-[min(92vw,760px)] -translate-x-1/2 -translate-y-1/2 gap-4 overflow-y-auto rounded-lg border border-border bg-card p-5 shadow-2xl">
          <Dialog.Title className="text-lg font-semibold">글 다듬기</Dialog.Title>
          <div className="flex gap-2">
            <Button variant={mode === 'STRICT' ? 'default' : 'outline'} size="sm" onClick={() => setMode('STRICT')}>
              엄격
            </Button>
            <Button variant={mode === 'RELAXED' ? 'default' : 'outline'} size="sm" onClick={() => setMode('RELAXED')}>
              자연스럽게
            </Button>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-3 text-sm leading-6 whitespace-pre-wrap">{source || '본문 없음'}</div>
            <div className="rounded-lg border border-border bg-background p-3 text-sm leading-6 whitespace-pre-wrap">
              {isPolishing ? 'AI가 글을 다듬는 중입니다.' : polishError || polishedContent || '결과가 여기에 표시됩니다.'}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              닫기
            </Button>
            <Button
              variant="outline"
              disabled={tooShort || isPolishing}
              onClick={() => requestPolish({ diaryId, content: source, mode })}
            >
              요청 · {usageText}
            </Button>
            <Button disabled={!polishedContent.trim() || isPolishing} onClick={() => onApply(polishedContent)}>
              적용
            </Button>
          </div>
          {tooShort ? <p className="text-sm text-muted-foreground">글 다듬기는 본문 50자 이상부터 사용할 수 있습니다.</p> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
