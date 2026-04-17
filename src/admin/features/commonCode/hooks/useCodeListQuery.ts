import { useQuery } from '@tanstack/react-query';
import { fetchAdminCodeList } from '@admin/pages/comCd/api/comCdApi';
import { assertOk } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type { StatusFilter } from '@admin/types/comCd';

const useCodeListQuery = (groupId: string, status: StatusFilter) =>
  useQuery({
    queryKey: adminKeys.comCd.codes(groupId, status),
    queryFn: () => fetchAdminCodeList(groupId, status).then(assertOk),
    enabled: !!groupId,
    staleTime: 0,
  });

export default useCodeListQuery;
