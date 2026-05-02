import { Route, Routes, useLocation } from 'react-router-dom';
import './App.css';
import AdminApp from './admin/routes/AdminApp.tsx';
import Workspace from './pages/Workspace/Workspace.tsx';
import NotFound from './pages/NotFound.tsx';

const MainSiteApp = () => (
  <Routes>
    <Route index element={<Workspace />} />
    <Route path="/login" element={<NotFound />} />
    <Route path="/aichat/*" element={<NotFound />} />
    <Route path="/notice" element={<NotFound />} />
    <Route path="/freebbs" element={<NotFound />} />
    <Route path="/mypage" element={<NotFound />} />
    <Route path="/mypageSample" element={<NotFound />} />
    <Route path="/intro" element={<NotFound />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }
  return <MainSiteApp />;
};

export default App;
