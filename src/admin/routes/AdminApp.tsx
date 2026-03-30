import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout';
import AdminRequireAuth from '../components/AdminRequireAuth';
import AdminLoginPage from '../pages/AdminLoginPage';
import AdminComCdPage from '../pages/AdminComCdPage';

const ROBOTS_META_NAME = 'robots';
const ADMIN_ROBOTS_CONTENT = 'noindex,nofollow';

const AdminApp = () => {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Heyso Admin';

    const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${ROBOTS_META_NAME}"]`);
    const previousContent = existing?.content ?? null;
    const meta = existing ?? document.createElement('meta');
    if (!existing) {
      meta.setAttribute('name', ROBOTS_META_NAME);
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', ADMIN_ROBOTS_CONTENT);

    return () => {
      document.title = previousTitle;
      if (previousContent === null) {
        meta.remove();
      } else {
        meta.setAttribute('content', previousContent);
      }
    };
  }, []);

  return (
    <Routes>
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route element={<AdminRequireAuth />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="com-codes" element={<AdminComCdPage />} />
          <Route index element={<Navigate to="/admin/com-codes" replace />} />
        </Route>
      </Route>
      <Route path="/admin/*" element={<Navigate to="/admin/com-codes" replace />} />
    </Routes>
  );
};

export default AdminApp;
