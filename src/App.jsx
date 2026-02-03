import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import './App.css';

import Diary from '@pages/Diary/Diary.jsx';
import Notice from '@pages/Notice.jsx';
import AiChatMain from '@pages/AIChat/AiChatMain.jsx';
import FreeBBS from '@pages/FreeBBS.jsx';
import Login from '@pages/Login.jsx';

import { useAuthStore } from '@stores/authStore.js';
import ConfirmDialog from '@components/ConfirmDialog.jsx';
import defaultUserPic from '@assets/default_user_pic.svg';
import MyPageSample from './pages/MyPage/MyPageSample';

import * as Dialog from '@radix-ui/react-dialog';
import { Toaster } from 'sonner';

import DiaryEditDialog from '@pages/Diary/components/DiaryEditDialog.jsx';
import DiaryNudgeToast from '@components/DiaryNudgeToast.jsx';
import { formatDate } from '@lib/dateFormatters.js';

import { useDiaryNudgeToast } from '@hooks/useDiaryNudgeToast.jsx';

/** =========================
 *  Env / Constants
 *  ========================= */

// 로그인 후 10초 뒤 노출
const DIARY_NUDGE_DELAY_MS = 7_000;

const navLinkClass = ({ isActive }) =>
  `px-4 py-2 rounded-full transition-colors ${
    isActive ? 'bg-amber/20 text-clay font-semibold' : 'hover:bg-amber/10'
  }`;

/** =========================
 *  App
 *  ========================= */
const App = () => {
  /** -------------------------
   *  Router / Store
   *  ------------------------- */
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const auth = useAuthStore((s) => s.auth);
  const authChecked = useAuthStore((s) => s.authChecked);
  const validateAuth = useAuthStore((s) => s.validateAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  /** -------------------------
   *  Derived State
   *  ------------------------- */
  const isAuthenticated = useMemo(() => authChecked && !!auth, [authChecked, auth]);

  const displayName = useMemo(() => {
    const raw = auth?.userName ?? auth?.username ?? auth?.nickname;
    return typeof raw === 'string' && raw.trim() ? raw : 'My';
  }, [auth]);

  const profileImgUrl = useMemo(() => {
    const raw = auth?.profileImgUrl;
    return typeof raw === 'string' && raw.trim() ? raw : defaultUserPic;
  }, [auth]);

  const todayKey = useMemo(() => formatDate(new Date()), []);

  // TODO: 실제 “오늘 일기 작성 여부”로 교체
  const hasWrittenToday = false;

  /** -------------------------
   *  UI State
   *  ------------------------- */
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickWriteOpen, setQuickWriteOpen] = useState(false);

  const userMenuRef = useRef(null);
  const hasValidatedRef = useRef(false);

  /** -------------------------
   *  Auth bootstrap (1회만)
   *  ------------------------- */
  useEffect(() => {
    if (hasValidatedRef.current) return;
    hasValidatedRef.current = true;
    validateAuth();
  }, [validateAuth]);

  /** -------------------------
   *  Diary Nudge Toast (hook)
   *  ------------------------- */
  useDiaryNudgeToast({
    enabled: isAuthenticated && !hasWrittenToday,
    todayKey,
    delayMs: DIARY_NUDGE_DELAY_MS,
    pathname: location.pathname,
    ToastComponent: DiaryNudgeToast,
    onGoWrite: () => setQuickWriteOpen(true),
  });

  /** -------------------------
   *  User menu close handlers
   *  ------------------------- */
  useEffect(() => {
    if (!userMenuOpen) return;

    const handleOutsideClick = (event) => {
      if (!userMenuRef.current) return;
      if (userMenuRef.current.contains(event.target)) return;
      setUserMenuOpen(false);
    };

    const handleEscape = (event) => {
      if (event.key === 'Escape') setUserMenuOpen(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [userMenuOpen]);

  /** -------------------------
   *  Actions
   *  ------------------------- */
  const openLogoutConfirm = useCallback(() => setLogoutConfirmOpen(true), []);

  const handleLogoutConfirm = useCallback(() => {
    // 인증 정보 초기화 + 관련 캐시 정리
    clearAuth();
    queryClient.removeQueries({ queryKey: ['diaryEntries'] });

    // 홈으로 이동
    navigate('/', { replace: true });

    setLogoutConfirmOpen(false);
  }, [clearAuth, navigate, queryClient]);

  const handleLogoutCancel = useCallback(() => setLogoutConfirmOpen(false), []);

  const handleMyPage = () => {
    navigate('/mypage');
    setUserMenuOpen(false);
  };

  /** =========================
   *  Render
   *  ========================= */
  return (
    <div className="min-h-screen flex flex-col">
      {/* ---------- Header / Navigation ---------- */}
      <header className="sticky top-0 z-10 backdrop-blur bg-linen/80 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-clay">
            <NavLink to="/" className="text-2xl font-bold text-clay">
              Heyso Diary
            </NavLink>
          </div>

          <nav className="flex gap-2">
            <NavLink to="/" end className={navLinkClass}>
              Diary
            </NavLink>
            <NavLink to="/notice" className={navLinkClass}>
              Notice
            </NavLink>
            <NavLink to="/aichat" className={navLinkClass}>
              AI Chat
            </NavLink>
            <NavLink to="/freebbs" className={navLinkClass}>
              FreeBBS
            </NavLink>

            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                  className={navLinkClass({ isActive: false })}
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={userMenuOpen}
                >
                  <span className="flex items-center gap-2">
                    <img
                      src={profileImgUrl}
                      alt={displayName}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                    <span className="hidden sm:inline">{displayName}</span>
                  </span>
                </button>

                {userMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-44 rounded-2xl border border-sand/50 bg-white/95 p-2 text-sm shadow-soft backdrop-blur"
                    role="menu"
                  >
                    <button
                      className="w-full rounded-xl px-3 py-2 text-left text-clay transition-colors hover:bg-amber/10"
                      type="button"
                      onClick={handleMyPage}
                      role="menuitem"
                    >
                      마이페이지
                    </button>

                    <button
                      className="mt-1 w-full rounded-xl px-3 py-2 text-left text-clay transition-colors hover:bg-amber/10"
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        openLogoutConfirm();
                      }}
                      role="menuitem"
                    >
                      로그아웃
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink to="/login" state={{ from: location }} className={navLinkClass}>
                LogIn
              </NavLink>
            )}
          </nav>
        </div>
      </header>

      {/* ---------- Main ---------- */}
      <main className="flex-1">
        <div className="grid gap-6 lg:grid-cols-[180px_minmax(0,1fr)_180px]">
          <aside className="hidden lg:ml-[10px] lg:flex h-full min-h-[200px] items-start justify-center rounded-2xl border border-sand/40 bg-white/60 p-4 text-sm font-semibold text-clay/70">
            {/* 광고주 모집 */}
          </aside>

          <div className="min-w-0">
            <div className="max-w-7xl mx-auto px-4 py-0">
              <Routes>
                <Route index element={<Diary />} />
                <Route path="notice" element={<Notice />} />
                <Route path="aichat" element={<AiChatMain />} />
                <Route path="freebbs" element={<FreeBBS />} />
                <Route path="login" element={<Login />} />
                <Route path="mypage" element={<MyPageSample />} />
              </Routes>
            </div>
          </div>

          <aside className="hidden lg:mr-[10px] lg:flex h-full min-h-[200px] items-start justify-center rounded-2xl border border-sand/40 bg-white/60 p-4 text-sm font-semibold text-clay/70">
            {/* 광고주 모집 */}
          </aside>
        </div>
      </main>

      {/* ---------- Footer ---------- */}
      <footer className="border-t border-sand/50">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-clay/70">
          © {new Date().getFullYear()} Heyso Diary
        </div>
      </footer>

      {/* ---------- Global dialogs / toasts ---------- */}
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

      <Toaster position="bottom-right" />

      {/* Global: 오늘 날짜로 일기쓰기 모달 */}
      <Dialog.Root open={quickWriteOpen} onOpenChange={setQuickWriteOpen}>
        {quickWriteOpen && (
          <DiaryEditDialog
            diaryId={null}
            isOpen={quickWriteOpen}
            onClose={() => setQuickWriteOpen(false)}
            onView={null}
          />
        )}
      </Dialog.Root>
    </div>
  );
};

export default App;
