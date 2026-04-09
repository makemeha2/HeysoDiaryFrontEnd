import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import type { ColumnDef } from '@tanstack/react-table';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import {
  getAiRuntimeProfileList,
  createAiRuntimeProfile,
  updateAiRuntimeProfile,
  deleteAiRuntimeProfile,
} from '@admin/lib/aiTemplateApi';
import { clearAdminAccessToken } from '@admin/lib/auth';
import type { AiRuntimeProfile, AiRuntimeProfileCreateRequest } from '@admin/types/aiTemplate';
import type { StatusFilter } from '@admin/types/comCd';

type ProfileForm = {
  profileKey: string;
  profileName: string;
  domainType: string;
  provider: string;
  model: string;
  temperature: string;
  topP: string;
  maxTokens: string;
  description: string;
  isActive: boolean;
};

const initialForm: ProfileForm = {
  profileKey: '',
  profileName: '',
  domainType: '',
  provider: '',
  model: '',
  temperature: '',
  topP: '',
  maxTokens: '',
  description: '',
  isActive: true,
};

const AdminRuntimeProfilePage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [profiles, setProfiles] = useState<AiRuntimeProfile[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<AiRuntimeProfile | null>(null);
  const [form, setForm] = useState<ProfileForm>(initialForm);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

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

  const loadProfiles = useCallback(
    async (s: StatusFilter) => {
      const result = await getAiRuntimeProfileList(s);
      if (!result.ok) {
        handleApiError(result.status, '런타임 프로파일 목록을 불러오지 못했습니다.');
        return;
      }
      setProfiles(result.data ?? []);
    },
    [handleApiError],
  );

  useEffect(() => {
    setErrorMessage(null);
    loadProfiles(status);
  }, [status, loadProfiles]);

  const handleOpenCreate = () => {
    setEditingProfile(null);
    setForm(initialForm);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = useCallback((profile: AiRuntimeProfile) => {
    setEditingProfile(profile);
    setForm({
      profileKey: profile.profileKey,
      profileName: profile.profileName,
      domainType: profile.domainType,
      provider: profile.provider ?? '',
      model: profile.model,
      temperature: profile.temperature != null ? String(profile.temperature) : '',
      topP: profile.topP != null ? String(profile.topP) : '',
      maxTokens: profile.maxTokens != null ? String(profile.maxTokens) : '',
      description: profile.description ?? '',
      isActive: profile.isActive === 1,
    });
    setIsDialogOpen(true);
  }, []);

  const handleSave = async () => {
    if (!form.profileName.trim() || !form.model.trim() || !form.domainType.trim()) {
      setErrorMessage('프로파일명, 도메인 유형, 모델은 필수입니다.');
      return;
    }

    setErrorMessage(null);
    const payload: AiRuntimeProfileCreateRequest = {
      profileKey: form.profileKey.trim(),
      profileName: form.profileName.trim(),
      domainType: form.domainType.trim(),
      model: form.model.trim(),
      provider: form.provider.trim() || undefined,
      temperature: form.temperature !== '' ? Number(form.temperature) : null,
      topP: form.topP !== '' ? Number(form.topP) : null,
      maxTokens: form.maxTokens !== '' ? Number(form.maxTokens) : null,
      description: form.description.trim() || undefined,
    };

    const result =
      editingProfile == null
        ? await createAiRuntimeProfile(payload)
        : await updateAiRuntimeProfile(editingProfile.runtimeProfileId, {
            profileName: payload.profileName,
            domainType: payload.domainType,
            model: payload.model,
            provider: payload.provider,
            temperature: payload.temperature,
            topP: payload.topP,
            maxTokens: payload.maxTokens,
            description: payload.description,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '저장에 실패했습니다.');
      return;
    }

    setAlertMessage(editingProfile == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsDialogOpen(false);
    await loadProfiles(status);
  };

  const handleDelete = async (id: number) => {
    const result = await deleteAiRuntimeProfile(id);
    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '삭제에 실패했습니다.');
      return;
    }
    setAlertMessage('삭제되었습니다.');
    setConfirmDeleteId(null);
    await loadProfiles(status);
  };

  const columns = useMemo<ColumnDef<AiRuntimeProfile>[]>(
    () => [
      { accessorKey: 'profileKey', header: 'Profile Key' },
      { accessorKey: 'profileName', header: '프로파일명' },
      { accessorKey: 'domainType', header: '도메인' },
      { accessorKey: 'model', header: '모델' },
      {
        accessorKey: 'temperature',
        header: 'Temperature',
        cell: ({ row }) => row.original.temperature ?? '-',
      },
      {
        accessorKey: 'topP',
        header: 'Top P',
        cell: ({ row }) => row.original.topP ?? '-',
      },
      {
        accessorKey: 'maxTokens',
        header: 'Max Tokens',
        cell: ({ row }) => row.original.maxTokens ?? '-',
      },
      {
        accessorKey: 'isActive',
        header: '상태',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              row.original.isActive === 1
                ? 'bg-amber/20 text-clay'
                : 'bg-sand/30 text-clay/50'
            }`}
          >
            {row.original.isActive === 1 ? '활성' : '비활성'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenEdit(row.original);
              }}
              className="rounded border border-sand px-2 py-0.5 text-xs text-clay hover:bg-sand/30"
            >
              수정
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setConfirmDeleteId(row.original.runtimeProfileId);
              }}
              className="rounded border border-sand px-2 py-0.5 text-xs text-clay/70 hover:bg-sand/30"
            >
              삭제
            </button>
          </div>
        ),
      },
    ],
    [handleOpenEdit],
  );

  const isCreateMode = editingProfile == null;

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">런타임 프로파일 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">AI 실행 설정을 등록/수정합니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold text-clay">프로파일 목록</h2>
          <div className="flex items-center gap-2">
            <StatusFilterSelect value={status} onChange={setStatus} />
            <button
              type="button"
              onClick={() => loadProfiles(status)}
              className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
            >
              새로고침
            </button>
            <button
              type="button"
              onClick={handleOpenCreate}
              className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
            >
              새 프로파일
            </button>
          </div>
        </div>

        <AdminDataTable
          data={profiles}
          columns={columns}
          rowKey={(row) => String(row.runtimeProfileId)}
          emptyMessage="런타임 프로파일이 없습니다."
          maxHeightClassName="max-h-[500px]"
        />
      </section>

      {/* 등록/수정 다이얼로그 */}
      <Dialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">
              {isCreateMode ? '런타임 프로파일 등록' : '런타임 프로파일 수정'}
            </Dialog.Title>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Profile Key <span className="text-blush">*</span></span>
                <input
                  value={form.profileKey}
                  readOnly={!isCreateMode}
                  onChange={(e) => setForm((p) => ({ ...p, profileKey: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
                  placeholder="예: DIARY_AI_DEFAULT"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">프로파일명 <span className="text-blush">*</span></span>
                <input
                  value={form.profileName}
                  onChange={(e) => setForm((p) => ({ ...p, profileName: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">도메인 유형 <span className="text-blush">*</span></span>
                <input
                  value={form.domainType}
                  onChange={(e) => setForm((p) => ({ ...p, domainType: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: DIARY"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Provider</span>
                <input
                  value={form.provider}
                  onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: openai"
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">모델 <span className="text-blush">*</span></span>
                <input
                  value={form.model}
                  onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: gpt-4o"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Temperature</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={form.temperature}
                  onChange={(e) => setForm((p) => ({ ...p, temperature: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 0.7"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Top P</span>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={form.topP}
                  onChange={(e) => setForm((p) => ({ ...p, topP: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 0.9"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Max Tokens</span>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={form.maxTokens}
                  onChange={(e) => setForm((p) => ({ ...p, maxTokens: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 2000"
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">설명</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  rows={2}
                />
              </label>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsDialogOpen(false)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
              >
                저장
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* 삭제 확인 다이얼로그 */}
      <Dialog.Root open={confirmDeleteId != null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">삭제 확인</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-clay/80">
              이 런타임 프로파일을 삭제하시겠습니까? (비활성 처리됩니다)
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteId != null && handleDelete(confirmDeleteId)}
                className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
              >
                삭제
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AdminAlertDialog
        open={!!alertMessage}
        onOpenChange={(open) => { if (!open) setAlertMessage(null); }}
        title="알림"
        description={alertMessage ?? ''}
      />
    </div>
  );
};

export default AdminRuntimeProfilePage;
