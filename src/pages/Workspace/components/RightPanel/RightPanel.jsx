import { X } from 'lucide-react';

import AiCommentPanel from './AiCommentPanel.jsx';
import TagFilterPanel from './TagFilterPanel.jsx';

const RightPanel = ({ state, diary }) => {
  if (state.rightPanelMode === 'hidden') return null;

  const currentDiary = diary.dailyDiaries?.[0] ?? null;
  const title = state.rightPanelMode === 'ai-comment' ? 'AI 코멘트' : '태그 필터';
  const body =
    state.rightPanelMode === 'ai-comment' ? (
      <AiCommentPanel diaryId={currentDiary?.diaryId ?? null} />
    ) : (
      <TagFilterPanel diaries={diary.diaries ?? []} />
    );

  const content = (
    <aside className="flex h-full flex-col border-l border-sand/60 bg-linen/95 p-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-bold text-clay">{title}</h2>
        <button type="button" className="rounded-full p-2 hover:bg-white" onClick={() => state.setRightPanelMode('hidden')} aria-label="패널 닫기">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">{body}</div>
    </aside>
  );

  return (
    <>
      <div className="hidden shrink-0 md:block" style={{ width: state.rightPanelWidth }}>
        {content}
      </div>
      <div className="fixed inset-0 z-50 md:hidden">
        <button type="button" className="absolute inset-0 bg-black/35" aria-label="패널 닫기" onClick={() => state.setRightPanelMode('hidden')} />
        <div className="absolute inset-x-0 bottom-0 h-[50vh] rounded-t-3xl bg-linen shadow-2xl">{content}</div>
      </div>
    </>
  );
};

export default RightPanel;

