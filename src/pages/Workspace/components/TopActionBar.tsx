import { LogOut, Menu, MessageSquareText, PenLine, Settings } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeSelector from './ThemeSelector';
import { mockTokenUsage } from '../lib/mockData';
// NOTE: JSX 모듈을 import — 타입 추론 제한. 향후 TSX 전환 후보.
import { useAuthStore } from '@stores/authStore.js';

type Props = {
  viewMode: 'diary' | 'settings';
  onOpenSidebar: () => void;
  onOpenPolish: () => void;
  onToggleAi: () => void;
  onSettings: () => void;
};

export default function TopActionBar({ viewMode, onOpenSidebar, onOpenPolish, onToggleAi, onSettings }: Props) {
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((s: any) => s.clearAuth);

  const logout = () => {
    clearAuth();
    queryClient.removeQueries({ queryKey: ['diaryEntries'] });
  };

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-3 backdrop-blur md:px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenSidebar} aria-label="사이드바 열기">
          <Menu className="h-5 w-5" />
        </Button>
        <span className="text-sm font-semibold">{viewMode === 'settings' ? '설정' : '오늘의 일기'}</span>
        <Badge className="hidden sm:inline-flex">
          토큰 {mockTokenUsage.used}/{mockTokenUsage.limit}
        </Badge>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onOpenPolish}>
          <PenLine className="h-4 w-4" />
          <span className="hidden sm:inline">글 다듬기</span>
        </Button>
        <Button variant="outline" size="sm" onClick={onToggleAi}>
          <MessageSquareText className="h-4 w-4" />
          <span className="hidden sm:inline">AI 코멘트</span>
        </Button>
        <div className="hidden md:block">
          <ThemeSelector />
        </div>
        <Button variant="ghost" size="icon" onClick={onSettings} aria-label="설정">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="로그아웃">
          <LogOut className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
