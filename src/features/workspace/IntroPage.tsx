import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import type { ReactNode } from 'react';
import { ArrowRight, BookOpen, CalendarDays, Sparkles, Wand2 } from 'lucide-react';
import { authFetch, type AuthData } from '@lib/apiClient';
import { useAuthStore } from '@stores/authStore.js';
import { showError } from '@/lib/confirm';

const FEATURES = [
  {
    icon: <BookOpen className="w-4 h-4" />,
    title: '매일의 기록',
    desc: '감정과 생각을 자유롭게 담는 나만의 일기 공간',
  },
  {
    icon: <Sparkles className="w-4 h-4" />,
    title: 'AI 피드백',
    desc: '일기를 읽고 따뜻한 코멘트를 전해드려요',
  },
  {
    icon: <Wand2 className="w-4 h-4" />,
    title: '글 다듬기',
    desc: 'AI가 일기를 더 아름답게 다듬어 드립니다',
  },
  {
    icon: <CalendarDays className="w-4 h-4" />,
    title: '감정 캘린더',
    desc: '날짜별 감정 기록으로 나의 패턴을 발견하세요',
  },
];

type LoginTriggerProps = {
  children: ReactNode;
  className: string;
  googleSize?: 'large' | 'medium' | 'small';
  googleWidth: number;
  onSuccess: (credentialResponse: CredentialResponse) => void;
  onError: () => void;
};

function LoginTrigger({
  children,
  className,
  googleSize = 'large',
  googleWidth,
  onSuccess,
  onError,
}: LoginTriggerProps) {
  return (
    <div className="relative inline-flex overflow-hidden rounded-lg">
      <button type="button" tabIndex={-1} className={`pointer-events-none ${className}`}>
        {children}
      </button>
      <div className="absolute inset-0 z-10 opacity-[0.01]">
        <GoogleLogin
          onSuccess={onSuccess}
          onError={onError}
          text="continue_with"
          shape="rectangular"
          size={googleSize}
          width={googleWidth}
        />
      </div>
    </div>
  );
}

export default function IntroPage() {
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      await showError({ title: '로그인 실패', message: 'Google ID token을 받지 못했습니다.' });
      return;
    }

    const res = await authFetch<AuthData>('/api/auth/oauth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      await showError({ title: '로그인 실패', message: 'Google 로그인 처리 중 문제가 발생했습니다.' });
      return;
    }

    setAuth(res.data);
  };

  const handleGoogleError = () => {
    showError({ title: '로그인 실패', message: 'Google 로그인을 다시 시도해 주세요.' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <BookOpen className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-serif text-sm font-semibold text-foreground">HeysoDiary</span>
        </div>
        <LoginTrigger
          className="px-3 py-1 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          googleSize="medium"
          googleWidth={140}
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
        >
          로그인 하기
        </LoginTrigger>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-lg">
          <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-[11px] font-medium px-3 py-1 rounded-full mb-6 border border-primary/20">
            <Sparkles className="w-3 h-3" />
            AI 피드백 일기 서비스
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-foreground leading-tight text-balance mb-4">
            오늘 하루를
            <br />
            기록해 보세요
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed text-pretty mb-8 max-w-sm mx-auto">
            HeysoDiary는 당신의 감정과 이야기를 소중히 담아두는 공간입니다. AI가 읽고 따뜻한 피드백을
            전해드려요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <LoginTrigger
              className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-6 py-2.5 rounded-lg hover:opacity-90 active:scale-[0.98] transition-all"
              googleWidth={180}
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            >
              일기 쓰러 가기
              <ArrowRight className="w-4 h-4" />
            </LoginTrigger>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground border border-border px-6 py-2.5 rounded-lg hover:bg-muted transition-all"
            >
              데모 둘러보기
            </button>
          </div>
        </div>
      </main>

      <section className="px-6 pb-16">
        <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="bg-surface border border-border/60 rounded-xl p-4 text-center hover:border-primary/30 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                {feature.icon}
              </div>
              <p className="text-xs font-medium text-foreground mb-1">{feature.title}</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-border/40 px-6 py-4 text-center">
        <p className="text-[11px] text-muted-foreground">
          &copy; 2026 HeysoDiary. 나만의 따뜻한 기록 공간.
        </p>
      </footer>
    </div>
  );
}
