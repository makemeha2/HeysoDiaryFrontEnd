import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import { buildCodeColumns } from './columns/codeColumns';
import { buildCodeGroupColumns } from './columns/codeGroupColumns';
import CodeFormDialog from './components/CodeFormDialog';
import CodeGroupFormDialog from './components/CodeGroupFormDialog';
import {
  createAdminCode,
  createAdminGroup,
  fetchAdminCodeList,
  fetchAdminGroupList,
  updateAdminCode,
  updateAdminGroup,
} from './api/comCdApi';
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

  const [groupStatus, setGroupStatus] = useState<StatusFilter>('ACTIVE');
  const [codeStatus, setCodeStatus] = useState<StatusFilter>('ACTIVE');
  const [showEditedAt, setShowEditedAt] = useState(false);

  const [groups, setGroups] = useState<CommonCodeGroup[]>([]);
  const [codes, setCodes] = useState<CommonCode[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedCodeId, setSelectedCodeId] = useState('');

  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<CommonCodeGroup | null>(null);
  const [editingCode, setEditingCode] = useState<CommonCode | null>(null);

  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.groupId === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );

  const handleApiError = useCallback(
    (status: number, fallback: string) => {
      if (status === 401) {
        clearAdminAccessToken();
        navigate('/admin/login?reason=sessionExpired', {
          replace: true,
          state: { from: '/admin/com-codes' },
        });
        return;
      }
      if (status === 403) {
        setErrorMessage('관리자 권한이 없습니다.');
        return;
      }
      setErrorMessage(fallback);
    },
    [navigate],
  );

  const loadGroups = useCallback(
    async (status: StatusFilter, keepSelectionId?: string) => {
      const result = await fetchAdminGroupList(status);
      if (!result.ok) {
        handleApiError(result.status, '그룹 목록을 불러오지 못했습니다.');
        return null;
      }

      const next = result.data ?? [];
      setGroups(next);

      const preservedId = keepSelectionId ?? '';
      const hasPreserved = next.some((group) => group.groupId === preservedId);
      const firstActive = next.find((group) => group.isActive)?.groupId;
      const nextSelectedGroupId = hasPreserved ? preservedId : firstActive ?? next[0]?.groupId ?? '';

      setSelectedGroupId(nextSelectedGroupId);
      return nextSelectedGroupId;
    },
    [handleApiError],
  );

  const loadCodes = useCallback(
    async (groupId: string, status: StatusFilter, keepSelectionId?: string) => {
      if (!groupId) {
        setCodes([]);
        setSelectedCodeId('');
        return;
      }

      const result = await fetchAdminCodeList(groupId, status);
      if (!result.ok) {
        handleApiError(result.status, '코드 목록을 불러오지 못했습니다.');
        return;
      }

      const next = result.data ?? [];
      setCodes(next);

      const preservedId = keepSelectionId ?? '';
      const hasPreserved = next.some((code) => code.codeId === preservedId);
      setSelectedCodeId(hasPreserved ? preservedId : next[0]?.codeId ?? '');
    },
    [handleApiError],
  );

  useEffect(() => {
    setErrorMessage(null);
    loadGroups(groupStatus, selectedGroupId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupStatus]);

  useEffect(() => {
    setErrorMessage(null);
    loadCodes(selectedGroupId, codeStatus, selectedCodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, codeStatus]);

  const refreshGroups = async () => {
    await loadGroups(groupStatus, selectedGroupId);
  };

  const refreshCodes = async () => {
    if (!selectedGroupId) {
      setErrorMessage('먼저 그룹을 선택하세요.');
      return;
    }

    await loadCodes(selectedGroupId, codeStatus, selectedCodeId);
  };

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

    const result =
      mode === 'create'
        ? await createAdminGroup(payload)
        : await updateAdminGroup(payload.groupId, {
            groupName: payload.groupName,
            isActive: payload.isActive,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '그룹 저장에 실패했습니다.');
      return;
    }

    setAlertMessage(mode === 'create' ? '등록되었습니다.' : '수정되었습니다.');
    setIsGroupDialogOpen(false);

    const nextGroupId = await loadGroups(groupStatus, payload.groupId);
    if (nextGroupId) {
      await loadCodes(nextGroupId, codeStatus, selectedCodeId);
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

    const result =
      mode === 'create'
        ? await createAdminCode(payload.groupId, {
            codeId: payload.codeId,
            codeName: payload.codeName,
            sortSeq: Number(payload.sortSeq),
            extraInfo1: payload.extraInfo1.trim() || undefined,
            extraInfo2: payload.extraInfo2.trim() || undefined,
            isActive: payload.isActive,
          })
        : await updateAdminCode(payload.groupId, payload.codeId, {
            codeName: payload.codeName,
            sortSeq: Number(payload.sortSeq),
            extraInfo1: payload.extraInfo1.trim() || undefined,
            extraInfo2: payload.extraInfo2.trim() || undefined,
            isActive: payload.isActive,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '코드 저장에 실패했습니다.');
      return;
    }

    setAlertMessage(mode === 'create' ? '등록되었습니다.' : '수정되었습니다.');
    setIsCodeDialogOpen(false);
    await loadCodes(payload.groupId, codeStatus, payload.codeId);
  };

  const groupColumns = useMemo(
    () => buildCodeGroupColumns({ showEditedAt, onEdit: handleOpenEditGroupDialog }),
    [showEditedAt, handleOpenEditGroupDialog],
  );

  const codeColumns = useMemo(
    () => buildCodeColumns({ showEditedAt, onEdit: handleOpenEditCodeDialog }),
    [showEditedAt, handleOpenEditCodeDialog],
  );

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
                onClick={refreshGroups}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreateGroupDialog}
                className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
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
            emptyMessage="그룹 데이터가 없습니다."
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
                onClick={refreshCodes}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreateCodeDialog}
                className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
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
            emptyMessage="코드 데이터가 없습니다."
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
          if (!open) {
            setAlertMessage(null);
          }
        }}
        title="알림"
        description={alertMessage ?? ''}
      />
    </div>
  );
};

export default AdminComCdPage;
