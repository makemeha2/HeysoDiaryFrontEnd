import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { loginAdmin } from '../lib/authApi';
import { setAdminAccessToken } from '../lib/auth';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fromPath = useMemo(() => {
    const state = location.state as { from?: string } | null;
    return state?.from && state.from.startsWith('/admin') ? state.from : '/admin/com-codes';
  }, [location.state]);

  const notice = new URLSearchParams(location.search).get('reason');
  const isSessionExpired = notice === 'sessionExpired';

  useEffect(() => {
    document.body.classList.add('admin-theme');
    return () => {
      document.body.classList.remove('admin-theme');
    };
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await loginAdmin(loginId.trim(), password);
      if (!result.ok) {
        if (result.status === 401) {
          setErrorMessage('아이디 또는 비밀번호가 올바르지 않습니다.');
        } else if (result.status === 403) {
          setErrorMessage('관리자 권한이 없는 계정입니다.');
        } else {
          setErrorMessage(result.errorMessage ?? '로그인에 실패했습니다.');
        }
        return;
      }

      if (!result.data?.accessToken) {
        setErrorMessage('토큰 발급에 실패했습니다.');
        return;
      }

      setAdminAccessToken(result.data.accessToken);
      navigate(fromPath, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#2f5f9126_0%,transparent_35%),linear-gradient(180deg,#f4f8fd_0%,#e8f0fa_100%)] px-4">
      <section className="w-full max-w-md rounded-2xl border border-sand/70 bg-white/88 p-6 shadow-xl backdrop-blur">
        <h1 className="text-2xl font-semibold text-clay">Admin Login</h1>
        <p className="mt-1 text-sm text-clay/70">관리자 계정으로 로그인하세요.</p>

        {isSessionExpired && (
          <div className="mt-4 rounded-md border border-amber/25 bg-amber/10 px-3 py-2 text-sm text-clay">
            세션이 만료되었습니다. 다시 로그인해 주세요.
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-sm text-clay">
            {errorMessage}
          </div>
        )}

        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <label className="block text-sm text-clay/80">
            Login ID
            <input
              value={loginId}
              onChange={(event) => setLoginId(event.target.value)}
              className="mt-1 w-full rounded-md border border-sand bg-white/90 px-3 py-2 text-clay outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
              autoComplete="username"
              required
            />
          </label>

          <label className="block text-sm text-clay/80">
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-md border border-sand bg-white/90 px-3 py-2 text-clay outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
              autoComplete="current-password"
              required
            />
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <p className="mt-4 text-xs text-clay/60">
          사용자 페이지로 이동:
          {' '}
          <Link to="/" className="font-medium text-amber no-underline">
            Heyso Diary
          </Link>
        </p>
      </section>
    </div>
  );
};

export default AdminLoginPage;
