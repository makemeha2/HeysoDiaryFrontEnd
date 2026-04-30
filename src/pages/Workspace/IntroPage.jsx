import { useRef } from 'react';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';
import { BookOpen, MessageSquareHeart, Palette, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useAuthStore } from '@stores/authStore.js';

const loginWithGoogle = async ({ credential, setAuth, navigate }) => {
  const baseURL =
    import.meta.env.VITE_APP_ENV === 'PROD' ? '' : import.meta.env.VITE_API_BASE_URL;
  const apiBase = (baseURL || '').replace(/\/$/, '');
  const res = await axios.post(`${apiBase}/api/auth/oauth/google`, { idToken: credential });
  const data = res.data;

  setAuth({
    accessToken: data.accessToken,
    userId: data.userId,
    email: data.email,
    nickname: data.nickname,
    profileImgUrl: data.profileImgUrl,
    role: data.role,
    provider: 'google',
    grantedAt: Date.now(),
    idToken: credential,
  });

  navigate('/', { replace: true });
};

const features = [
  { icon: BookOpen, title: '바로 쓰는 오늘 일기', desc: '첫 화면에서 날짜를 고르고 바로 작성합니다.' },
  { icon: MessageSquareHeart, title: 'AI 코멘트', desc: '저장된 일기에 공감과 피드백을 받습니다.' },
  { icon: Search, title: '검색과 태그', desc: '제목, 본문, 태그로 기록을 다시 찾습니다.' },
  { icon: Palette, title: '개인 테마', desc: '다섯 가지 색감으로 작업 공간을 바꿉니다.' },
];

const IntroPage = () => {
  const setAuth = useAuthStore((state) => state.setAuth);
  const navigate = useNavigate();
  const featureRef = useRef(null);

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle({
        credential: credentialResponse.credential,
        setAuth,
        navigate,
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-linen text-clay">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5">
        <a href="/" className="text-xl font-bold text-clay">
          Heyso Diary
        </a>
        <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.error('Google login failed')} />
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-92px)] max-w-6xl content-center gap-10 px-4 pb-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
          <div className="max-w-2xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-amber">
              Private writing workspace
            </p>
            <h1 className="text-5xl font-bold leading-tight text-clay sm:text-6xl">
              Heyso Diary
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-clay/75">
              로그인하면 오늘의 일기를 바로 쓰고, 저장한 기록 위에서 AI 코멘트와 글다듬기를 이어갈 수 있습니다.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <GoogleLogin onSuccess={handleGoogleSuccess} onError={() => console.error('Google login failed')} />
              <button
                type="button"
                className="rounded-full border border-sand bg-white/70 px-5 py-3 text-sm font-semibold text-clay shadow-soft hover:bg-white"
                onClick={() => featureRef.current?.scrollIntoView({ behavior: 'smooth' })}
              >
                더 알아보기
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-sand/60 bg-white/75 p-5 shadow-soft">
            <div className="rounded-3xl bg-linen p-5">
              <div className="mb-5 flex items-center justify-between text-sm text-clay/60">
                <span>오늘</span>
                <span>AI ready</span>
              </div>
              <div className="space-y-4">
                <div className="h-8 w-3/4 rounded-lg bg-clay/15" />
                <div className="h-24 rounded-xl bg-white/80" />
                <div className="grid grid-cols-3 gap-2">
                  <div className="h-16 rounded-xl bg-amber/25" />
                  <div className="h-16 rounded-xl bg-moss/25" />
                  <div className="h-16 rounded-xl bg-blush/25" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={featureRef} className="border-t border-sand/50 bg-white/45 py-14">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <article key={feature.title} className="rounded-2xl border border-sand/60 bg-white/70 p-5 shadow-soft">
                  <Icon className="mb-4 h-5 w-5 text-amber" />
                  <h2 className="font-semibold text-clay">{feature.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-clay/70">{feature.desc}</p>
                </article>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
};

export default IntroPage;

