import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { clearAdminAccessToken } from '../lib/auth';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm transition-colors ${
    isActive ? 'bg-clay text-white' : 'bg-white text-clay hover:bg-sand/70'
  }`;

const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    clearAdminAccessToken();
    navigate('/admin/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/admin/com-codes" className="text-lg font-semibold text-clay no-underline">
            Heyso Admin
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-100"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-7xl gap-4 p-4 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <nav className="flex flex-col gap-2">
            <NavLink to="/admin/com-codes" className={navClass}>
              공통코드 관리
            </NavLink>
          </nav>
        </aside>
        <main className="rounded-xl border border-slate-200 bg-white p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
