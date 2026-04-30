import { Route, Routes, useLocation } from 'react-router-dom';

import './App.css';

import { ThemeProvider } from '@/contexts/ThemeContext.jsx';
import AiChatMain from '@pages/AIChat/AiChatMain.jsx';
import Login from '@pages/Login.jsx';
import Workspace from '@pages/Workspace/Workspace.jsx';

import AdminApp from './admin/routes/AdminApp.tsx';

const MainSiteApp = () => (
  <ThemeProvider>
    <Routes>
      <Route index element={<Workspace />} />
      <Route path="login" element={<Login />} />
      <Route path="aichat" element={<AiChatMain />} />
    </Routes>
  </ThemeProvider>
);

const App = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }
  return <MainSiteApp />;
};

export default App;

