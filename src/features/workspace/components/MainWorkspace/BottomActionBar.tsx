import { Check, Save, Trash2 } from 'lucide-react';
import { confirm } from '@/lib/confirm';

type Props = {
  saveStatus: 'idle' | 'saving' | 'saved';
  canDelete: boolean;
  showDeleteConfirm: boolean;
  onSave: () => void;
  onRequestDelete: () => void;
  onConfirmDelete: () => void;
  onCancelDelete: () => void;
  onOpenAi: () => void;
  onOpenPolish: () => void;
  isQuotaExhausted: boolean;
};

// 하단 작업 바 — AI/다듬기/삭제/저장 액션을 한 줄에 고정
const BottomActionBar = ({
  saveStatus,
  canDelete,
  showDeleteConfirm,
  onSave,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onOpenAi,
  onOpenPolish,
  isQuotaExhausted,
}: Props) => {
  const handleQuotaExhausted = async () => {
    const confirmed = await confirm({
      title: '오늘의 AI 사용 횟수를 모두 사용했어요. 광고를 시청하면 추가 사용이 가능합니다.',
      confirmLabel: '광고 보기',
      cancelLabel: '닫기',
    });

    if (confirmed) {
      // TODO: 광고 시청 흐름 연결
    }
  };

  const handleOpenAi = async () => {
    if (isQuotaExhausted) {
      await handleQuotaExhausted();
      return;
    }
    onOpenAi();
  };

  const handleOpenPolish = async () => {
    if (isQuotaExhausted) {
      await handleQuotaExhausted();
      return;
    }
    onOpenPolish();
  };

  return (
    <div className="shrink-0 border-t border-border/60 bg-background/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-8 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenAi}
            className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            AI 코멘트
          </button>
          <button
            type="button"
            onClick={handleOpenPolish}
            className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
          >
            글 다듬기
          </button>
        </div>

        <div className="flex items-center gap-2">
          {canDelete && !showDeleteConfirm ? (
            <button
              type="button"
              onClick={onRequestDelete}
              className="flex items-center gap-1 rounded px-2 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
              aria-label="일기 삭제"
            >
              <Trash2 className="h-3.5 w-3.5" />
              삭제
            </button>
          ) : null}

          {showDeleteConfirm ? (
            <div className="animate-in slide-in-from-right-2 flex items-center gap-1.5">
              <span className="text-xs text-destructive">정말 삭제할까요?</span>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="rounded bg-destructive px-2 py-1 text-xs text-destructive-foreground transition-opacity hover:opacity-90"
              >
                삭제
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
              >
                취소
              </button>
            </div>
          ) : null}

          <button
            type="button"
            onClick={onSave}
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            className={[
              'flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-xs font-medium transition-all',
              saveStatus === 'saved'
                ? 'cursor-default bg-green-500/20 text-green-600'
                : saveStatus === 'saving'
                  ? 'cursor-wait bg-muted text-muted-foreground'
                  : 'bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98]',
            ].join(' ')}
          >
            {saveStatus === 'saved' ? (
              <>
                <Check className="h-3.5 w-3.5" />
                저장됨
              </>
            ) : saveStatus === 'saving' ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent" />
                저장 중...
              </>
            ) : (
              <>
                <Save className="h-3.5 w-3.5" />
                저장
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BottomActionBar;
