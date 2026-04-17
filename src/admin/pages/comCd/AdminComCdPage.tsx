import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import { buildCodeColumns } from './columns/codeColumns';
import { buildCodeGroupColumns } from './columns/codeGroupColumns';
import CodeFormDialog from './components/CodeFormDialog';
import CodeGroupFormDialog from './components/CodeGroupFormDialog';
import useCodeGroupsQuery from '@admin/features/commonCode/hooks/useCodeGroupsQuery';
import useCodeListQuery from '@admin/features/commonCode/hooks/useCodeListQuery';
import useCodeGroupMutations from '@admin/features/commonCode/hooks/useCodeGroupMutations';
import useCodeMutations from '@admin/features/commonCode/hooks/useCodeMutations';
import { adminKeys } from '@admin/lib/queryKeys';
import { AdminApiError } from '@admin/lib/queryClientHelpers';
import { clearAdminAccessToken } from '@admin/lib/auth';
import type { CommonCode, CommonCodeGroup, StatusFilter } from '@admin/types/comCd';

type GroupSubmitPayload = {
  groupId: string;
  groupName: string;
  isActive: boolean;
};

type CodeSubmitPayload = {
  groupId: string;
  codeId: string;
  codeName: string;
  sortSeq: number;
  extraInfo1: string;
  extraInfo2: string;
  isActive: boolean;
};

const AdminComCdPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [groupStatus, setGroupStatus] = useState<StatusFilter>('ACTIVE');
  const [codeStatus, setCodeStatus] = useState<StatusFilter>('ACTIVE');
  const [showEditedAt, setShowEditedAt] = useState(false);

  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedCodeId, setSelectedCodeId] = useState('');

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CommonCodeGroup | null>(null);
  const [editingCode, setEditingCode] = useState<CommonCode | null>(null);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // mutation 후 우선 선택할 ID를 임시 보관 (ref이므로 리렌더 유발 없음)
  const preferredGroupIdRef = useRef('');
  const preferredCodeIdRef = useRef('');

  const groupsQuery = useCodeGroupsQuery(groupStatus);
  const codesQuery = useCodeListQuery(selectedGroupId, codeStatus);

  const groups = groupsQuery.data ?? [];
  const codes = codesQuery.data ?? [];

  const handleApiError = useCallback(
    (err: AdminApiError) => {
      if (err.status === 401) {
        clearAdminAccessToken();
        navigate('/admin/login?reason=sessionExpired', {
          replace: true,
          state: { from: '/admin/com-codes' },
        });
        return;
      }
      setErrorMessage(err.status === 403 ? '관리자 권한이 없습니다.' : err.errorMessage);
    },
    [navigate],
  );

  // 그룹 데이터가 바뀔 때마다 selectedGroupId 정규화
  useEffect(() => {
    const data = groupsQuery.data ?? [];
    if (!data.length) {
      setSelectedGroupId('');
      return;
    }
    const preferred = preferredGroupIdRef.current;
    const hasPreferred = !!preferred && data.some((g) => g.groupId === preferred);
    const hasCurrent = !!selectedGroupId && data.some((g) => g.groupId === selectedGroupId);
    const firstActive = data.find((g) => g.isActive)?.groupId;

    if (hasPreferred) {
      setSelectedGroupId(preferred);
    } else if (!hasCurrent) {
      setSelectedGroupId(firstActive ?? data[0]?.groupId ?? '');
    }
    preferredGroupIdRef.current = '';
  }, [groupsQuery.data]);

  // 코드 데이터가 바뀔 때마다 selectedCodeId 정규화
  useEffect(() => {
    const data = codesQuery.data ?? [];
    if (!data.length) {
      setSelectedCodeId('');
      return;
    }
    const preferred = preferredCodeIdRef.current;
    const hasPreferred = !!preferred && data.some((c) => c.codeId === preferred);
    const hasCurrent = !!selectedCodeId && data.some((c) => c.codeId === selectedCodeId);

    if (hasPreferred) {
      setSelectedCodeId(preferred);
    } else if (!hasCurrent) {
      setSelectedCodeId(data[0]?.codeId ?? '');
    }
    preferredCodeIdRef.current = '';
  }, [codesQuery.data]);

  // 쿼리 에러 처리
  useEffect(() => {
    const err = groupsQuery.error ?? codesQuery.error;
    if (err instanceof AdminApiError) handleApiError(err);
  }, [groupsQuery.error, codesQuery.error, handleApiError]);

  const { createMutation: createGroupMutation, updateMutation: updateGroupMutation } =
    useCodeGroupMutations({
      onSuccess: (mode) => {
        setAlertMessage(mode === 'create' ? '등록되었습니다.' : '수정되었습니다.');
        setIsGroupDialogOpen(false);
      },
      onError: handleApiError,
    });

  const { createMutation: createCodeMutation, updateMutation: updateCodeMutation } =
    useCodeMutations({
      codeStatus,
      onSuccess: (mode) => {
        setAlertMessage(mode === 'create' ? '등록되었습니다.' : '수정되었습니다.');
        setIsCodeDialogOpen(false);
      },
      onError: handleApiError,
    });

  const selectedGroup = useMemo(
    () => groups.find((group) => group.groupId === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const handleOpenCreateGroupDialog = () => {
    setEditingGroup(null);
    setIsGroupDialogOpen(true);
  };

  const handleOpenEditGroupDialog = useCallback((group: CommonCodeGroup) => {
    setSelectedGroupId(group.groupId);
    setEditingGroup(group);
    setIsGroupDialogOpen(true);
  }, []);

  const handleGroupSubmit = async (payload: GroupSubmitPayload, mode: 'create' | 'edit') => {
    setErrorMessage(null);
    preferredGroupIdRef.current = payload.groupId;
    if (mode === 'create') {
      await createGroupMutation.mutateAsync(payload);
    } else {
      await updateGroupMutation.mutateAsync(payload);
    }
  };

  const handleOpenCreateCodeDialog = () => {
    if (!selectedGroupId) {
      setErrorMessage('먼저 그룹을 선택하세요.');
      return;
    }
    setEditingCode(null);
    setIsCodeDialogOpen(true);
  };

  const handleOpenEditCodeDialog = useCallback((code: CommonCode) => {
    setSelectedGroupId(code.groupId);
    setSelectedCodeId(code.codeId);
    setEditingCode(code);
    setIsCodeDialogOpen(true);
  }, []);

  const handleCodeSubmit = async (payload: CodeSubmitPayload, mode: 'create' | 'edit') => {
    setErrorMessage(null);
    if (!payload.groupId) {
      setErrorMessage('먼저 그룹을 선택하세요.');
      return;
    }
    preferredCodeIdRef.current = payload.codeId;
    const normalized = {
      ...payload,
      sortSeq: Number(payload.sortSeq),
      extraInfo1: payload.extraInfo1.trim() || undefined,
      extraInfo2: payload.extraInfo2.trim() || undefined,
    };
    if (mode === 'create') {
      await createCodeMutation.mutateAsync(normalized);
    } else {
      await updateCodeMutation.mutateAsync(normalized);
    }
  };

  const groupColumns = useMemo(
    () => buildCodeGroupColumns({ showEditedAt, onEdit: handleOpenEditGroupDialog }),
    [showEditedAt, handleOpenEditGroupDialog],
  );

  const codeColumns = useMemo(
    () => buildCodeColumns({ showEditedAt, onEdit: handleOpenEditCodeDialog }),
    [showEditedAt, handleOpenEditCodeDialog],
  );

  const isGroupMutating = createGroupMutation.isPending || updateGroupMutation.isPending;
  const isCodeMutating = createCodeMutation.isPending || updateCodeMutation.isPending;

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">공통코드 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">그룹과 코드를 등록/수정 모달로 관리합니다.</p>
        </div>

        <label className="flex items-center gap-2 rounded-md border border-sand/70 bg-white px-2 py-1 text-xs text-clay sm:text-sm">
          <input
            type="checkbox"
            checked={showEditedAt}
            onChange={(event) => setShowEditedAt(event.target.checked)}
          />
          편집일시
        </label>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[3fr_7fr]">
        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">공통코드그룹</h2>
            <div className="flex items-center gap-2">
              <StatusFilterSelect value={groupStatus} onChange={setGroupStatus} />
              <button
                type="button"
                onClick={() =>
                  queryClient.invalidateQueries({ queryKey: adminKeys.comCd.groups(groupStatus) })
                }
                disabled={groupsQuery.isFetching}
                className="rounded border border-sand px-2 py-1 text-xs text-clay disabled:opacity-50 sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreateGroupDialog}
                disabled={isGroupMutating}
                className="rounded bg-clay px-2 py-1 text-xs text-white disabled:opacity-50 sm:text-sm"
              >
                등록
              </button>
            </div>
          </div>

          <AdminDataTable
            data={groups}
            columns={groupColumns}
            rowKey={(row) => row.groupId}
            onRowClick={(row) => setSelectedGroupId(row.groupId)}
            selectedKey={selectedGroupId}
            emptyMessage={groupsQuery.isLoading ? '불러오는 중...' : '그룹 데이터가 없습니다.'}
            maxHeightClassName="max-h-[360px]"
          />

          {selectedGroup && (
            <p className="text-xs text-clay/80 sm:text-sm">
              선택 그룹: <strong>{selectedGroup.groupId}</strong>
            </p>
          )}
        </section>

        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">공통코드</h2>
            <div className="flex items-center gap-2">
              <StatusFilterSelect value={codeStatus} onChange={setCodeStatus} />
              <button
                type="button"
                onClick={() => {
                  if (!selectedGroupId) {
                    setErrorMessage('먼저 그룹을 선택하세요.');
                    return;
                  }
                  queryClient.invalidateQueries({
                    queryKey: adminKeys.comCd.codes(selectedGroupId, codeStatus),
                  });
                }}
                disabled={codesQuery.isFetching}
                className="rounded border border-sand px-2 py-1 text-xs text-clay disabled:opacity-50 sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreateCodeDialog}
                disabled={isCodeMutating}
                className="rounded bg-clay px-2 py-1 text-xs text-white disabled:opacity-50 sm:text-sm"
              >
                등록
              </button>
            </div>
          </div>

          <AdminDataTable
            data={codes}
            columns={codeColumns}
            rowKey={(row) => row.codeId}
            onRowClick={(row) => setSelectedCodeId(row.codeId)}
            selectedKey={selectedCodeId}
            emptyMessage={codesQuery.isLoading ? '불러오는 중...' : '코드 데이터가 없습니다.'}
            maxHeightClassName="max-h-[360px]"
          />
        </section>
      </div>

      <CodeGroupFormDialog
        open={isGroupDialogOpen}
        onOpenChange={setIsGroupDialogOpen}
        group={editingGroup}
        onSubmit={handleGroupSubmit}
      />

      <CodeFormDialog
        open={isCodeDialogOpen}
        onOpenChange={setIsCodeDialogOpen}
        selectedGroupId={selectedGroupId}
        code={editingCode}
        onSubmit={handleCodeSubmit}
      />

      <AdminAlertDialog
        open={!!alertMessage}
        onOpenChange={(open) => {
          if (!open) setAlertMessage(null);
        }}
        title="알림"
        description={alertMessage ?? ''}
      />
    </div>
  );
};

export default AdminComCdPage;
