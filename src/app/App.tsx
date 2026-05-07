import { useLocation } from 'react-router-dom';
import AdminApp from '@admin/routes/AdminApp';
import { MainRouter } from './router';

const App = () => {
  const location = useLocation();
  if (location.pathname.startsWith('/admin')) {
    return <AdminApp />;
  }
  return <MainRouter />;
};

export default App;
