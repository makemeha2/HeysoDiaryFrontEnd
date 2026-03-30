import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StatusFilterSelect from '../components/StatusFilterSelect';
import {
  createAdminCode,
  createAdminGroup,
  deleteAdminCode,
  deleteAdminGroup,
  fetchAdminCodeDetail,
  fetchAdminCodeList,
  fetchAdminGroupDetail,
  fetchAdminGroupList,
  updateAdminCode,
  updateAdminGroup,
} from '../lib/comCdApi';
import { clearAdminAccessToken } from '../lib/auth';
import type { CommonCode, CommonCodeGroup, StatusFilter } from '../types/comCd';

const emptyGroupForm = { groupId: '', groupName: '', isActive: true };
const emptyCodeCreateForm = {
  codeId: '',
  codeName: '',
  isActive: true,
  extraInfo1: '',
  extraInfo2: '',
  sortSeq: 0,
};
const emptyCodeEditForm = { codeName: '', isActive: true, extraInfo1: '', extraInfo2: '', sortSeq: 0 };

const AdminComCdPage = () => {
  const navigate = useNavigate();

  const [groupStatus, setGroupStatus] = useState<StatusFilter>('ACTIVE');
  const [codeStatus, setCodeStatus] = useState<StatusFilter>('ACTIVE');
  const [groups, setGroups] = useState<CommonCodeGroup[]>([]);
  const [codes, setCodes] = useState<CommonCode[]>([]);

  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedCodeId, setSelectedCodeId] = useState<string>('');

  const [groupCreateForm, setGroupCreateForm] = useState(emptyGroupForm);
  const [groupEditForm, setGroupEditForm] = useState({ groupName: '', isActive: true });
  const [codeCreateForm, setCodeCreateForm] = useState(emptyCodeCreateForm);
  const [codeEditForm, setCodeEditForm] = useState(emptyCodeEditForm);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forbiddenMessage, setForbiddenMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const selectedGroup = useMemo(
    () => groups.find((group) => group.groupId === selectedGroupId) ?? null,
    [groups, selectedGroupId],
  );
  const selectedCode = useMemo(
    () => codes.find((code) => code.codeId === selectedCodeId) ?? null,
    [codes, selectedCodeId],
  );

  const handleAuthFailure = (status: number, fallback: string) => {
    if (status === 401) {
      clearAdminAccessToken();
      navigate('/admin/login?reason=sessionExpired', { replace: true, state: { from: '/admin/com-codes' } });
      return true;
    }
    if (status === 403) {
      setForbiddenMessage('이 요청에 대한 관리자 권한(scope=admin)이 없습니다.');
      return true;
    }
    setErrorMessage(fallback);
    return true;
  };

  const loadGroups = async (nextStatus: StatusFilter, keepSelection = true) => {
    const result = await fetchAdminGroupList(nextStatus);
    if (!result.ok) return handleAuthFailure(result.status, '그룹 목록 조회에 실패했습니다.');

    setGroups(result.data ?? []);
    setSelectedCodeId('');
    if (!keepSelection) {
      setSelectedGroupId('');
      return false;
    }

    const hasSelected = (result.data ?? []).some((group) => group.groupId === selectedGroupId);
    setSelectedGroupId(hasSelected ? selectedGroupId : (result.data?.[0]?.groupId ?? ''));
    return false;
  };

  const loadGroupDetail = async (groupId: string) => {
    const result = await fetchAdminGroupDetail(groupId);
    if (!result.ok) return handleAuthFailure(result.status, '그룹 상세 조회에 실패했습니다.');
    setGroupEditForm({
      groupName: result.data.groupName,
      isActive: result.data.isActive,
    });
    return false;
  };

  const loadCodes = async (groupId: string, nextStatus: StatusFilter, keepSelection = true) => {
    const result = await fetchAdminCodeList(groupId, nextStatus);
    if (!result.ok) return handleAuthFailure(result.status, '코드 목록 조회에 실패했습니다.');

    setCodes(result.data ?? []);
    if (!keepSelection) {
      setSelectedCodeId('');
      return false;
    }
    const hasSelected = (result.data ?? []).some((code) => code.codeId === selectedCodeId);
    setSelectedCodeId(hasSelected ? selectedCodeId : (result.data?.[0]?.codeId ?? ''));
    return false;
  };

  const loadCodeDetail = async (groupId: string, codeId: string) => {
    const result = await fetchAdminCodeDetail(groupId, codeId);
    if (!result.ok) return handleAuthFailure(result.status, '코드 상세 조회에 실패했습니다.');
    setCodeEditForm({
      codeName: result.data.codeName,
      isActive: result.data.isActive,
      extraInfo1: result.data.extraInfo1 ?? '',
      extraInfo2: result.data.extraInfo2 ?? '',
      sortSeq: result.data.sortSeq ?? 0,
    });
    return false;
  };

  useEffect(() => {
    setErrorMessage(null);
    setForbiddenMessage(null);
    setNoticeMessage(null);
    loadGroups(groupStatus, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupStatus]);

  useEffect(() => {
    if (!selectedGroupId) {
      setCodes([]);
      setSelectedCodeId('');
      return;
    }
    loadGroupDetail(selectedGroupId);
    loadCodes(selectedGroupId, codeStatus, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, codeStatus]);

  useEffect(() => {
    if (!selectedGroupId || !selectedCodeId) {
      setCodeEditForm(emptyCodeEditForm);
      return;
    }
    loadCodeDetail(selectedGroupId, selectedCodeId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, selectedCodeId]);

  const refreshSelectedGroupAndCodes = async () => {
    const ended = await loadGroups(groupStatus, true);
    if (!ended && selectedGroupId) {
      await loadCodes(selectedGroupId, codeStatus, true);
    }
  };

  const handleGroupCreate = async () => {
    if (!groupCreateForm.groupId.trim() || !groupCreateForm.groupName.trim()) {
      setErrorMessage('그룹 ID와 그룹명은 필수입니다.');
      return;
    }

    const result = await createAdminGroup({
      groupId: groupCreateForm.groupId.trim(),
      groupName: groupCreateForm.groupName.trim(),
      isActive: groupCreateForm.isActive,
    });
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '그룹 생성에 실패했습니다.');

    setGroupCreateForm(emptyGroupForm);
    setNoticeMessage('그룹이 생성되었습니다.');
    await refreshSelectedGroupAndCodes();
  };

  const handleGroupUpdate = async () => {
    if (!selectedGroupId) return;
    const result = await updateAdminGroup(selectedGroupId, {
      groupName: groupEditForm.groupName.trim(),
      isActive: groupEditForm.isActive,
    });
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '그룹 수정에 실패했습니다.');

    setNoticeMessage('그룹이 수정되었습니다.');
    await refreshSelectedGroupAndCodes();
  };

  const handleGroupDelete = async () => {
    if (!selectedGroupId) return;
    const result = await deleteAdminGroup(selectedGroupId);
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '그룹 삭제에 실패했습니다.');

    setNoticeMessage('그룹이 비활성화되었습니다.');
    await loadGroups(groupStatus, true);
  };

  const handleGroupReactivate = async () => {
    if (!selectedGroup) return;
    const result = await updateAdminGroup(selectedGroup.groupId, {
      groupName: selectedGroup.groupName,
      isActive: true,
    });
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '그룹 재활성화에 실패했습니다.');

    setNoticeMessage('그룹이 재활성화되었습니다.');
    await refreshSelectedGroupAndCodes();
  };

  const handleCodeCreate = async () => {
    if (!selectedGroupId) {
      setErrorMessage('먼저 그룹을 선택하세요.');
      return;
    }
    if (!codeCreateForm.codeId.trim() || !codeCreateForm.codeName.trim()) {
      setErrorMessage('코드 ID와 코드명은 필수입니다.');
      return;
    }

    const result = await createAdminCode(selectedGroupId, {
      codeId: codeCreateForm.codeId.trim(),
      codeName: codeCreateForm.codeName.trim(),
      isActive: codeCreateForm.isActive,
      extraInfo1: codeCreateForm.extraInfo1.trim() || undefined,
      extraInfo2: codeCreateForm.extraInfo2.trim() || undefined,
      sortSeq: Number(codeCreateForm.sortSeq),
    });
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '코드 생성에 실패했습니다.');

    setCodeCreateForm(emptyCodeCreateForm);
    setNoticeMessage('코드가 생성되었습니다.');
    await loadCodes(selectedGroupId, codeStatus, true);
  };

  const handleCodeUpdate = async () => {
    if (!selectedGroupId || !selectedCodeId) return;
    const result = await updateAdminCode(selectedGroupId, selectedCodeId, {
      codeName: codeEditForm.codeName.trim(),
      isActive: codeEditForm.isActive,
      extraInfo1: codeEditForm.extraInfo1.trim() || undefined,
      extraInfo2: codeEditForm.extraInfo2.trim() || undefined,
      sortSeq: Number(codeEditForm.sortSeq),
    });
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '코드 수정에 실패했습니다.');

    setNoticeMessage('코드가 수정되었습니다.');
    await loadCodes(selectedGroupId, codeStatus, true);
    await loadCodeDetail(selectedGroupId, selectedCodeId);
  };

  const handleCodeDelete = async () => {
    if (!selectedGroupId || !selectedCodeId) return;
    const result = await deleteAdminCode(selectedGroupId, selectedCodeId);
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '코드 삭제에 실패했습니다.');

    setNoticeMessage('코드가 비활성화되었습니다.');
    await loadCodes(selectedGroupId, codeStatus, true);
  };

  const handleCodeReactivate = async () => {
    if (!selectedGroupId || !selectedCode) return;
    const result = await updateAdminCode(selectedGroupId, selectedCode.codeId, {
      codeName: selectedCode.codeName,
      isActive: true,
      extraInfo1: selectedCode.extraInfo1,
      extraInfo2: selectedCode.extraInfo2,
      sortSeq: selectedCode.sortSeq,
    });
    if (!result.ok) return handleAuthFailure(result.status, result.errorMessage ?? '코드 재활성화에 실패했습니다.');

    setNoticeMessage('코드가 재활성화되었습니다.');
    await loadCodes(selectedGroupId, codeStatus, true);
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-xl font-semibold text-slate-900">공통코드 관리자</h1>
        <p className="mt-1 text-sm text-slate-600">
          그룹/코드 CRUD, soft delete, update 재활성화를 처리합니다.
        </p>
      </header>

      {noticeMessage && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          {noticeMessage}
        </div>
      )}
      {forbiddenMessage && (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          {forbiddenMessage}
        </div>
      )}
      {errorMessage && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">그룹 목록</h2>
            <StatusFilterSelect value={groupStatus} onChange={setGroupStatus} />
          </div>
          <div className="max-h-72 overflow-auto rounded-md border border-slate-200">
            {groups.length === 0 && <p className="p-3 text-sm text-slate-500">데이터가 없습니다.</p>}
            {groups.map((group) => (
              <button
                key={group.groupId}
                type="button"
                onClick={() => setSelectedGroupId(group.groupId)}
                className={`flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left text-sm ${
                  selectedGroupId === group.groupId ? 'bg-clay/10' : 'hover:bg-slate-50'
                }`}
              >
                <span>
                  <strong>{group.groupId}</strong>
                  {' '}
                  {group.groupName}
                </span>
                <span className={group.isActive ? 'text-emerald-700' : 'text-slate-500'}>
                  {group.isActive ? '활성' : '비활성'}
                </span>
              </button>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-semibold">그룹 생성</h2>
          <div className="mt-3 grid gap-2">
            <input
              placeholder="groupId"
              value={groupCreateForm.groupId}
              onChange={(event) =>
                setGroupCreateForm((prev) => ({ ...prev, groupId: event.target.value }))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="groupName"
              value={groupCreateForm.groupName}
              onChange={(event) =>
                setGroupCreateForm((prev) => ({ ...prev, groupName: event.target.value }))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={groupCreateForm.isActive}
                onChange={(event) =>
                  setGroupCreateForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              활성
            </label>
            <button
              type="button"
              onClick={handleGroupCreate}
              className="rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white"
            >
              그룹 생성
            </button>
          </div>
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-semibold">그룹 수정/삭제/재활성화</h2>
          {!selectedGroup && <p className="mt-3 text-sm text-slate-500">그룹을 선택하세요.</p>}
          {selectedGroup && (
            <div className="mt-3 grid gap-2">
              <p className="text-sm text-slate-700">
                선택:
                {' '}
                <strong>{selectedGroup.groupId}</strong>
              </p>
              <input
                value={groupEditForm.groupName}
                onChange={(event) =>
                  setGroupEditForm((prev) => ({ ...prev, groupName: event.target.value }))
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={groupEditForm.isActive}
                  onChange={(event) =>
                    setGroupEditForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                활성
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleGroupUpdate}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  그룹 수정(update)
                </button>
                <button
                  type="button"
                  onClick={handleGroupDelete}
                  className="rounded-md border border-rose-300 px-3 py-2 text-sm text-rose-700"
                >
                  그룹 삭제(soft delete)
                </button>
                <button
                  type="button"
                  onClick={handleGroupReactivate}
                  className="rounded-md border border-emerald-300 px-3 py-2 text-sm text-emerald-700"
                >
                  그룹 재활성화(update)
                </button>
              </div>
            </div>
          )}
        </article>

        <article className="rounded-lg border border-slate-200 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">코드 목록</h2>
            <StatusFilterSelect value={codeStatus} onChange={setCodeStatus} />
          </div>
          {!selectedGroupId && <p className="text-sm text-slate-500">그룹 선택 후 조회됩니다.</p>}
          {selectedGroupId && (
            <div className="max-h-72 overflow-auto rounded-md border border-slate-200">
              {codes.length === 0 && <p className="p-3 text-sm text-slate-500">데이터가 없습니다.</p>}
              {codes.map((code) => (
                <button
                  key={code.codeId}
                  type="button"
                  onClick={() => setSelectedCodeId(code.codeId)}
                  className={`flex w-full items-center justify-between border-b border-slate-100 px-3 py-2 text-left text-sm ${
                    selectedCodeId === code.codeId ? 'bg-clay/10' : 'hover:bg-slate-50'
                  }`}
                >
                  <span>
                    <strong>{code.codeId}</strong>
                    {' '}
                    {code.codeName}
                  </span>
                  <span className={code.isActive ? 'text-emerald-700' : 'text-slate-500'}>
                    {code.isActive ? '활성' : '비활성'}
                  </span>
                </button>
              ))}
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-semibold">코드 생성</h2>
          <div className="mt-3 grid gap-2">
            <input
              placeholder="codeId"
              value={codeCreateForm.codeId}
              onChange={(event) =>
                setCodeCreateForm((prev) => ({ ...prev, codeId: event.target.value }))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="codeName"
              value={codeCreateForm.codeName}
              onChange={(event) =>
                setCodeCreateForm((prev) => ({ ...prev, codeName: event.target.value }))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              type="number"
              placeholder="sortSeq"
              value={codeCreateForm.sortSeq}
              onChange={(event) =>
                setCodeCreateForm((prev) => ({ ...prev, sortSeq: Number(event.target.value) }))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="extraInfo1"
              value={codeCreateForm.extraInfo1}
              onChange={(event) =>
                setCodeCreateForm((prev) => ({ ...prev, extraInfo1: event.target.value }))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <input
              placeholder="extraInfo2"
              value={codeCreateForm.extraInfo2}
              onChange={(event) =>
                setCodeCreateForm((prev) => ({ ...prev, extraInfo2: event.target.value }))
              }
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={codeCreateForm.isActive}
                onChange={(event) =>
                  setCodeCreateForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              활성
            </label>
            <button
              type="button"
              onClick={handleCodeCreate}
              className="rounded-md bg-clay px-3 py-2 text-sm font-semibold text-white"
            >
              코드 생성
            </button>
          </div>
        </article>

        <article className="rounded-lg border border-slate-200 p-4">
          <h2 className="text-base font-semibold">코드 수정/삭제/재활성화</h2>
          {!selectedCode && <p className="mt-3 text-sm text-slate-500">코드를 선택하세요.</p>}
          {selectedCode && (
            <div className="mt-3 grid gap-2">
              <p className="text-sm text-slate-700">
                선택:
                {' '}
                <strong>{selectedCode.codeId}</strong>
              </p>
              <input
                value={codeEditForm.codeName}
                onChange={(event) => setCodeEditForm((prev) => ({ ...prev, codeName: event.target.value }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="number"
                value={codeEditForm.sortSeq}
                onChange={(event) => setCodeEditForm((prev) => ({ ...prev, sortSeq: Number(event.target.value) }))}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={codeEditForm.extraInfo1}
                onChange={(event) =>
                  setCodeEditForm((prev) => ({ ...prev, extraInfo1: event.target.value }))
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                value={codeEditForm.extraInfo2}
                onChange={(event) =>
                  setCodeEditForm((prev) => ({ ...prev, extraInfo2: event.target.value }))
                }
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={codeEditForm.isActive}
                  onChange={(event) =>
                    setCodeEditForm((prev) => ({ ...prev, isActive: event.target.checked }))
                  }
                />
                활성
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleCodeUpdate}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  코드 수정(update)
                </button>
                <button
                  type="button"
                  onClick={handleCodeDelete}
                  className="rounded-md border border-rose-300 px-3 py-2 text-sm text-rose-700"
                >
                  코드 삭제(soft delete)
                </button>
                <button
                  type="button"
                  onClick={handleCodeReactivate}
                  className="rounded-md border border-emerald-300 px-3 py-2 text-sm text-emerald-700"
                >
                  코드 재활성화(update)
                </button>
              </div>
            </div>
          )}
        </article>
      </section>
    </div>
  );
};

export default AdminComCdPage;
