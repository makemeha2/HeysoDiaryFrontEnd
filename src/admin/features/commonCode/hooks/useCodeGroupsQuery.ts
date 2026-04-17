import { useQuery } from '@tanstack/react-query';
import { fetchAdminGroupList } from '@admin/pages/comCd/api/comCdApi';
import { assertOk } from '@admin/lib/queryClientHelpers';
import { adminKeys } from '@admin/lib/queryKeys';
import type { StatusFilter } from '@admin/types/comCd';

const useCodeGroupsQuery = (status: StatusFilter) =>
  useQuery({
    queryKey: adminKeys.comCd.groups(status),
    queryFn: () => fetchAdminGroupList(status).then(assertOk),
    staleTime: 0,
  });

export default useCodeGroupsQuery;
