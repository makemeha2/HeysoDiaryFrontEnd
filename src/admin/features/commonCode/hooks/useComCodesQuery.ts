import { useQuery } from '@tanstack/react-query';
import { fetchAdminCodeList } from '@admin/lib/comCdApi';
import { assertOk } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type { StatusFilter } from '@admin/types/comCd';

const COM_CODES_STALE_TIME = 5 * 60_000;

const useComCodesQuery = (groupId: string, status: StatusFilter = 'ACTIVE') =>
  useQuery({
    queryKey: adminKeys.comCd.codesByGroup(groupId),
    queryFn: () => fetchAdminCodeList(groupId, status).then(assertOk),
    enabled: !!groupId,
    staleTime: COM_CODES_STALE_TIME,
  });

export { COM_CODES_STALE_TIME };
export default useComCodesQuery;
