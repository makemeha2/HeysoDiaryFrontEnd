import { createContext, useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAdminAccessToken } from '@admin/lib/auth';
import { fetchAdminCodeList } from '@admin/lib/comCdApi';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';

type AdminPageContextValue = {
  alertMessage: string | null;
  errorMessage: string | null;
  notifySuccess: (msg: string) => void;
  notifyError: (msg: string | null) => void;
  clearAlert: () => void;
  handleApiError: (status: number, fallback: string) => void;
  loadComCodes: (groupId: string, status?: StatusFilter) => Promise<CommonCode[]>;
};

const AdminPageContext = createContext<AdminPageContextValue | null>(null);

export const AdminPageProvider = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleApiError = useCallback(
    (apiStatus: number, fallback: string) => {
      if (apiStatus === 401) {
        clearAdminAccessToken();
        navigate('/admin/login?reason=sessionExpired', { replace: true });
        return;
      }
      if (apiStatus === 403) {
        setErrorMessage('관리자 권한이 없습니다.');
        return;
      }
      setErrorMessage(fallback);
    },
    [navigate],
  );

  const loadComCodes = useCallback(
    async (groupId: string, status: StatusFilter = 'ACTIVE'): Promise<CommonCode[]> => {
      const result = await fetchAdminCodeList(groupId, status);
      return result.ok ? (result.data ?? []) : [];
    },
    [],
  );

  return (
    <AdminPageContext.Provider
      value={{
        alertMessage,
        errorMessage,
        notifySuccess: setAlertMessage,
        notifyError: setErrorMessage,
        clearAlert: () => setAlertMessage(null),
        handleApiError,
        loadComCodes,
      }}
    >
      {children}
    </AdminPageContext.Provider>
  );
};

export const useAdminPageContext = () => {
  const ctx = useContext(AdminPageContext);
  if (!ctx) throw new Error('useAdminPageContext must be used within AdminPageProvider');
  return ctx;
};
