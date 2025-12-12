import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import './App.css';
import Diary from './pages/Diary/Diary.jsx';
import Notice from './pages/Notice.jsx';
import AI from './pages/AI.jsx';
import FreeBBS from './pages/FreeBBS.jsx';
import Login from './pages/Login.jsx';
import { useEffect, useState } from 'react';
import { getAuthData, clearAuthData } from './lib/apiClient.js';
import { useAuthStore } from './stores/authStore.js';
import ConfirmDialog from './pages/ShareComponents/ConfirmDialog.jsx';
import { useQueryClient } from '@tanstack/react-query';

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full transition-colors ${
    isActive ? 'bg-amber/20 text-clay font-semibold' : 'hover:bg-amber/10'
  }`;

const App = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const auth = useAuthStore((s) => s.auth);
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  const queryClient = useQueryClient();

  useEffect(() => {
    const saved = getAuthData();
    if (saved) {
      setAuth(saved);
      console.log(saved);
    }
  }, [setAuth, location]);

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
  };

  const handleLogoutConfirm = () => {
    clearAuthData();
    clearAuth();
    queryClient.removeQueries({ queryKey: ['diaryEntries'] });

    navigate('/', { replace: true });

    setLogoutConfirmOpen(false);
  };

  const handleLogoutCancel = () => {
    setLogoutConfirmOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 backdrop-blur bg-linen/80 shadow-soft">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-clay">Heyso Diary</div>
          <nav className="flex gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Diary
            </NavLink>
            <NavLink to="/notice" className={navLinkClass}>
              Notice
            </NavLink>
            <NavLink to="/ai" className={navLinkClass}>
              AI
            </NavLink>
            <NavLink to="/freebbs" className={navLinkClass}>
              FreeBBS
            </NavLink>
            {auth ? (
              <button
                onClick={handleLogout}
                className={navLinkClass({ isActive: false })}
                type="button"
              >
                Logout
              </button>
            ) : (
              <NavLink
                to="/login"
                state={{ from: location }} // 로그인 후 돌아갈 위치
                className={navLinkClass}
              >
                LogIn
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Routes>
            <Route index element={<Diary />} />
            <Route path="notice" element={<Notice />} />
            <Route path="ai" element={<AI />} />
            <Route path="freebbs" element={<FreeBBS />} />
            <Route path="login" element={<Login />} />
          </Routes>
        </div>
      </main>

      <footer className="border-t border-sand/50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-clay/70">
          © {new Date().getFullYear()} Heyso Diary
        </div>
      </footer>

      <ConfirmDialog
        open={logoutConfirmOpen}
        onOpenChange={setLogoutConfirmOpen}
        title="로그아웃 하시겠습니까?"
        description="이 작업은 되돌릴 수 없습니다."
        confirmLabel="확인"
        cancelLabel="취소"
        onConfirm={handleLogoutConfirm}
        onCancel={handleLogoutCancel}
      />
    </div>
  );
};

export default App;
