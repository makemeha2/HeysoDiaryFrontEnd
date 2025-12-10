import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../stores/authStore.js';

const Login = () => {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const from = location.state?.from?.pathname || '/';

  function onSubmit(e) {
    e.preventDefault();

    navigate(from, { replace: true });

    alert(`로그인 요청\nID: ${id}`);
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential; // 구글에서 준 ID Token (JWT)
    const baseURL = import.meta.env.VITE_API_BASE_URL;

    try {
      // 1) 이 토큰을 백엔드로 전달
      // 2) 백엔드에서 검증 후 우리 서비스용 액세스 토큰 발급
      const res = await fetch(baseURL + '/api/auth/oauth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });

      if (!res.ok) {
        // 실패 처리
        console.error('구글 인증 처리 실패');
        return;
      }

      const data = await res.json();
      // 기대 응답:
      // { accessToken, userId, email, nickname, role }
      const authPayload = {
        accessToken: data.accessToken,
        userId: data.userId,
        email: data.email,
        nickname: data.nickname,
        role: data.role,
        provider: 'google',
        grantedAt: Date.now(),
        idToken,
      };

      setAuth(authPayload); // zustand store 에 반영

      console.log('로그인 성공', data);

      navigate(from, { replace: true });
    } catch (e) {
      console.error(e);
    }
  };

  const handleGoogleError = () => {
    console.error('Google 로그인 실패');
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-sand/50 bg-white/80 p-8 shadow-soft">
        <h1 className="mb-6 text-2xl font-bold text-clay">로그인</h1>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-id" className="mb-1 block text-sm text-clay/80">
              아이디
            </label>
            <input
              id="login-id"
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              className="w-full rounded-xl border border-sand/60 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
              placeholder="이메일 또는 아이디"
              autoComplete="username"
            />
          </div>

          <div>
            <label htmlFor="login-pw" className="mb-1 block text-sm text-clay/80">
              비밀번호
            </label>
            <input
              id="login-pw"
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              className="w-full rounded-xl border border-sand/60 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber/40"
              placeholder="비밀번호"
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="mt-2 w-full rounded-xl bg-amber px-4 py-3 font-semibold text-white hover:opacity-95 active:opacity-90"
          >
            로그인
          </button>
        </form>

        <div className="my-4 flex items-center gap-3 text-xs text-clay/60">
          <div className="h-px flex-1 bg-sand/60" />
          <span>또는</span>
          <div className="h-px flex-1 bg-sand/60" />
        </div>

        <div style={{ marginTop: 16 }}>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleError} />
        </div>

        <div className="mt-6 flex items-center justify-between text-sm">
          <button
            className="text-clay/70 hover:text-clay"
            onClick={() => alert('회원가입 (추가 필요)')}
          >
            회원가입
          </button>

          <div className="flex items-center text-clay/70">
            <button
              className="text-amber hover:opacity-90"
              onClick={() => alert('아이디 찾기 (추가 필요)')}
            >
              아이디찾기
            </button>
            <span className="mx-2 select-none text-sand/70">|</span>
            <button
              className="text-amber hover:opacity-90"
              onClick={() => alert('비밀번호 찾기 (추가 필요)')}
            >
              비밀번호 찾기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
