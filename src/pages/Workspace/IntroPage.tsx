import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { ArrowDown, BookOpen, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { authFetch } from '@lib/apiClient.js';
// NOTE: JSX 모듈을 import — 타입 추론 제한. 향후 TSX 전환 후보.
import { useAuthStore } from '@stores/authStore.js';
import { showError } from '@/lib/confirm';

export default function IntroPage() {
  const setAuth = useAuthStore((s: any) => s.setAuth);

  const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;

    if (!idToken) {
      await showError({ title: '로그인 실패', message: 'Google ID token을 받지 못했습니다.' });
      return;
    }

    const res = await authFetch('/api/auth/oauth/google', {
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
    <div className="min-h-screen bg-background text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2 font-semibold">
          <BookOpen className="h-5 w-5 text-primary" />
          <span>HeysoDiary</span>
        </div>
        <div className="overflow-hidden rounded-lg">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            text="signin_with"
            shape="rectangular"
            width="180"
          />
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-88px)] max-w-6xl content-center px-5 pb-16">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground">
              <Sparkles className="h-4 w-4 text-primary" />
              Workspace UX renewal
            </div>
            <h1 className="text-5xl font-semibold leading-tight text-foreground sm:text-6xl">
              오늘 하루를 기록해 보세요
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">
              일기 작성, AI 코멘트, 글 다듬기, 개인 설정을 하나의 작업 공간에서 이어갑니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <div className="overflow-hidden rounded-lg">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  text="continue_with"
                  shape="rectangular"
                  width="220"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => document.getElementById('intro-features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <ArrowDown className="h-4 w-4" />
                기능 보기
              </Button>
            </div>
          </div>
        </section>

        <section id="intro-features" className="border-t border-border bg-card/60 px-5 py-12">
          <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-3">
            {['플랫 에디터', 'AI 코멘트', '맞춤 설정'].map((title) => (
              <article key={title} className="rounded-lg border border-border bg-card p-5">
                <h2 className="font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  기록 흐름을 끊지 않도록 필요한 기능을 Workspace 안에 배치했습니다.
                </p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
