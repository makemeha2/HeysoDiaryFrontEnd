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
    <div className="min-h-screen bg-linen text-clay">
      <header className="border-b border-sand/70 bg-white/90">
        <div className="flex w-full items-center justify-between px-3 py-3 md:px-5">
          <Link to="/admin/com-codes" className="text-lg font-semibold text-clay no-underline">
            Heyso Admin
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-md border border-sand px-3 py-1.5 text-sm text-clay hover:bg-amber/10"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="grid w-full gap-3 p-3 md:grid-cols-[200px_minmax(0,1fr)] md:p-4">
        <aside className="rounded-xl border border-sand/70 bg-white p-3">
          <nav className="flex flex-col gap-2">
            <NavLink to="/admin/com-codes" className={navClass}>
              공통코드 관리
            </NavLink>
          </nav>
        </aside>
        <main className="rounded-xl border border-sand/70 bg-white p-3 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
