import { Bot, LogOut, MessageSquareHeart, Settings, Sparkles, Tags } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@stores/authStore.js';

import { TOKEN_USAGE_MOCK } from '../lib/mockData.js';
import ThemeSelector from './ThemeSelector.jsx';
import { useConfirm } from './modals/useConfirm.jsx';

const TopActionBar = ({ state, diary }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((store) => store.clearAuth);
  const auth = useAuthStore((store) => store.auth);
  const confirm = useConfirm();
  const currentDiary = diary.dailyDiaries?.[0] ?? null;
  const isSettings = state.viewMode === 'settings';

  const handleLogout = async () => {
    const ok = await confirm({
      variant: 'warning',
      title: '로그아웃 하시겠습니까?',
      message: '현재 브라우저의 인증 정보가 삭제됩니다.',
      confirmLabel: '로그아웃',
    });
    if (!ok) return;
    clearAuth();
    queryClient.removeQueries({ queryKey: ['diaryEntries'] });
    navigate('/', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-sand/60 bg-linen/90 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-3 px-4 pl-16 md:pl-5">
        <div className="min-w-0">
          <p className="truncate text-sm text-clay/60">
            {isSettings ? '설정' : `${state.selectedDate} workspace`}
          </p>
          <h1 className="truncate text-lg font-bold text-clay">
            {isSettings ? '환경 설정' : currentDiary?.title || '오늘의 일기'}
          </h1>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {!isSettings && (
            <>
              <span className="hidden rounded-full border border-sand bg-white/70 px-3 py-2 text-xs text-clay/70 lg:inline-flex">
                <Bot className="mr-1.5 h-3.5 w-3.5 text-amber" />
                {TOKEN_USAGE_MOCK.used}/{TOKEN_USAGE_MOCK.limit}
              </span>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-white/70 text-clay shadow-sm hover:bg-white"
                aria-label="글다듬기"
                onClick={() => window.dispatchEvent(new CustomEvent('workspace:open-polish'))}
              >
                <Sparkles className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-white/70 text-clay shadow-sm hover:bg-white"
                aria-label="AI 코멘트"
                onClick={() =>
                  state.setRightPanelMode((prev) => (prev === 'ai-comment' ? 'hidden' : 'ai-comment'))
                }
              >
                <MessageSquareHeart className="h-4 w-4" />
              </button>
              <button
                type="button"
                className="hidden h-10 w-10 items-center justify-center rounded-full border border-sand bg-white/70 text-clay shadow-sm hover:bg-white md:inline-flex"
                aria-label="태그 필터"
                onClick={() => state.setRightPanelMode((prev) => (prev === 'tags' ? 'hidden' : 'tags'))}
              >
                <Tags className="h-4 w-4" />
              </button>
            </>
          )}

          <ThemeSelector />
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-sand bg-white/70 text-clay shadow-sm hover:bg-white"
            aria-label="설정"
            onClick={() => state.setViewMode((prev) => (prev === 'settings' ? 'diary' : 'settings'))}
          >
            <Settings className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="hidden h-10 w-10 items-center justify-center rounded-full border border-sand bg-white/70 text-clay shadow-sm hover:bg-white sm:inline-flex"
            aria-label={`${auth?.nickname ?? '사용자'} 로그아웃`}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default TopActionBar;

