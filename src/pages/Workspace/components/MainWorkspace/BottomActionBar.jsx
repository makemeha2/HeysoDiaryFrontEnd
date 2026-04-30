import { MessageSquareHeart, Save, Sparkles, Trash2 } from 'lucide-react';

const BottomActionBar = ({
  canDelete,
  isSaving,
  onSave,
  onDelete,
  onOpenAiComment,
  onOpenPolish,
}) => (
  <div className="sticky bottom-0 mt-8 flex flex-wrap items-center justify-end gap-2 border-t border-sand/50 bg-linen/95 py-4 backdrop-blur">
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/75 px-4 py-2 text-sm font-semibold text-clay hover:bg-white"
      onClick={onOpenAiComment}
    >
      <MessageSquareHeart className="h-4 w-4" />
      AI 코멘트
    </button>
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-sand bg-white/75 px-4 py-2 text-sm font-semibold text-clay hover:bg-white"
      onClick={onOpenPolish}
    >
      <Sparkles className="h-4 w-4" />
      글다듬기
    </button>
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white/75 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
      disabled={!canDelete}
      onClick={onDelete}
    >
      <Trash2 className="h-4 w-4" />
      삭제
    </button>
    <button
      type="button"
      className="inline-flex items-center gap-2 rounded-full bg-amber px-5 py-2 text-sm font-semibold text-white shadow-soft hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isSaving}
      onClick={onSave}
    >
      <Save className="h-4 w-4" />
      {isSaving ? '저장 중' : '저장'}
    </button>
  </div>
);

export default BottomActionBar;

