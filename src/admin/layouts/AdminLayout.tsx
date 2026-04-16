import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAdminAccessToken } from '../lib/auth';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-clay text-white' : 'bg-white text-clay hover:bg-sand/70'
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    document.body.classList.add('admin-theme');
    return () => {
      document.body.classList.remove('admin-theme');
    };
  }, []);

  const handleLogout = () => {
    clearAdminAccessToken();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="flex h-screen flex-col bg-linen text-clay">
      <header className="border-b border-sand/70 bg-white/75 backdrop-blur">
        <div className="flex w-full items-center justify-between px-3 py-3 md:px-5">
          <Link to="/admin/com-codes" className="text-lg font-semibold text-clay no-underline">
            Heyso Admin
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-sand bg-white/80 px-3 py-1.5 text-sm text-clay hover:bg-amber/10"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 w-full gap-3 overflow-y-auto p-3 md:grid-cols-[200px_minmax(0,1fr)] md:p-4">
        <aside className="rounded-xl border border-sand/70 bg-white/82 p-3 backdrop-blur">
          <nav className="flex flex-col gap-2">
            <NavLink to="/admin/com-codes" className={navClass}>
              공통코드 관리
            </NavLink>
            <NavLink to="/admin/monitoring-events" className={navClass}>
              모니터링 이벤트
            </NavLink>

            <div className="mt-2 flex flex-col gap-1">
              <span className="px-1 text-xs font-medium text-clay/50 uppercase tracking-wide">
                AI 프롬프트 설정
              </span>
              <div className="ml-2 flex flex-col gap-1">
                <NavLink to="/admin/ai-template/templates" className={navClass}>
                  프롬프트 템플릿
                </NavLink>
                <NavLink to="/admin/ai-template/runtime-profiles" className={navClass}>
                  런타임 프로파일
                </NavLink>
                <NavLink to="/admin/ai-template/bindings" className={navClass}>
                  바인딩
                </NavLink>
              </div>
            </div>
          </nav>
        </aside>
        <main className="rounded-xl border border-sand/70 bg-white/82 p-3 backdrop-blur md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
