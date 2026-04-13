import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAdminAccessToken } from '@admin/lib/auth';
import { fetchAdminCodeList } from '@admin/lib/comCdApi';
import type { CommonCode, StatusFilter } from '@admin/types/comCd';

/**
 * admin 전체 공통 훅.
 * - handleApiError: 401/403/기타 에러 처리
 * - alertMessage / errorMessage: 알림·에러 상태
 * - loadDomainCodes: fetchAdminCodeList 래퍼 (groupId + status 파라미터)
 */
export const useAdminPageBase = () => {
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

  return {
    alertMessage,
    setAlertMessage,
    errorMessage,
    setErrorMessage,
    handleApiError,
    loadComCodes,
  };
};
