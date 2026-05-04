import { Route, Routes } from 'react-router-dom';
import Workspace from '@features/workspace/Workspace';
import NotFound from '@pages/NotFound';

export const MainRouter = () => (
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
