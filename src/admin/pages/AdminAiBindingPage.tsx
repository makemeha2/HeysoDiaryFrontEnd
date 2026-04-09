import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import type { ColumnDef } from '@tanstack/react-table';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import {
  getAiPromptBindingList,
  getAiPromptBindingDetail,
  createAiPromptBinding,
  updateAiPromptBinding,
  deleteAiPromptBinding,
} from '@admin/lib/aiTemplateApi';
import { clearAdminAccessToken } from '@admin/lib/auth';
import type {
  AiPromptBindingListItem,
  AiPromptBindingDetail,
  AiPromptBindingCreateRequest,
} from '@admin/types/aiTemplate';
import type { StatusFilter } from '@admin/types/comCd';

type BindingForm = {
  bindingName: string;
  domainType: string;
  featureKey: string;
  systemTemplateId: string;
  userTemplateId: string;
  runtimeProfileId: string;
  description: string;
};

const initialForm: BindingForm = {
  bindingName: '',
  domainType: '',
  featureKey: '',
  systemTemplateId: '',
  userTemplateId: '',
  runtimeProfileId: '',
  description: '',
};

const AdminAiBindingPage = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<StatusFilter>('ACTIVE');
  const [bindings, setBindings] = useState<AiPromptBindingListItem[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AiPromptBindingDetail | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBinding, setEditingBinding] = useState<AiPromptBindingListItem | null>(null);
  const [form, setForm] = useState<BindingForm>(initialForm);

  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
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

  const loadBindings = useCallback(
    async (s: StatusFilter) => {
      const result = await getAiPromptBindingList(s);
      if (!result.ok) {
        handleApiError(result.status, '바인딩 목록을 불러오지 못했습니다.');
        return;
      }
      setBindings(result.data ?? []);
    },
    [handleApiError],
  );

  const loadDetail = useCallback(
    async (id: number) => {
      const result = await getAiPromptBindingDetail(id);
      if (!result.ok) {
        handleApiError(result.status, '바인딩 상세를 불러오지 못했습니다.');
        return;
      }
      setDetail(result.data ?? null);
    },
    [handleApiError],
  );

  useEffect(() => {
    setErrorMessage(null);
    setSelectedId(null);
    setDetail(null);
    loadBindings(status);
  }, [status, loadBindings]);

  useEffect(() => {
    if (selectedId != null) {
      loadDetail(selectedId);
    } else {
      setDetail(null);
    }
  }, [selectedId, loadDetail]);

  const handleOpenCreate = () => {
    setEditingBinding(null);
    setForm(initialForm);
    setIsFormOpen(true);
  };

  const handleOpenEdit = useCallback((b: AiPromptBindingListItem) => {
    setEditingBinding(b);
    setForm({
      bindingName: b.bindingName,
      domainType: b.domainType,
      featureKey: b.featureKey,
      systemTemplateId: String(b.systemTemplateId),
      userTemplateId: String(b.userTemplateId),
      runtimeProfileId: String(b.runtimeProfileId),
      description: '',
    });
    setIsFormOpen(true);
  }, []);

  useEffect(() => {
    if (isFormOpen && editingBinding != null && detail != null && detail.bindingId === editingBinding.bindingId) {
      setForm((prev) => ({
        ...prev,
        description: detail.description ?? '',
      }));
    }
  }, [isFormOpen, editingBinding, detail]);

  const handleSave = async () => {
    if (
      !form.bindingName.trim() ||
      !form.domainType.trim() ||
      !form.featureKey.trim() ||
      !form.systemTemplateId.trim() ||
      !form.userTemplateId.trim() ||
      !form.runtimeProfileId.trim()
    ) {
      setErrorMessage('바인딩명, 도메인, Feature Key, System/User 템플릿 ID, 런타임 프로파일 ID는 필수입니다.');
      return;
    }
    setErrorMessage(null);

    const payload: AiPromptBindingCreateRequest = {
      bindingName: form.bindingName.trim(),
      domainType: form.domainType.trim(),
      featureKey: form.featureKey.trim(),
      systemTemplateId: Number(form.systemTemplateId),
      userTemplateId: Number(form.userTemplateId),
      runtimeProfileId: Number(form.runtimeProfileId),
      description: form.description.trim() || undefined,
    };

    const result =
      editingBinding == null
        ? await createAiPromptBinding(payload)
        : await updateAiPromptBinding(editingBinding.bindingId, {
            bindingName: payload.bindingName,
            domainType: payload.domainType,
            systemTemplateId: payload.systemTemplateId,
            userTemplateId: payload.userTemplateId,
            runtimeProfileId: payload.runtimeProfileId,
            description: payload.description,
          });

    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '저장에 실패했습니다.');
      return;
    }

    setAlertMessage(editingBinding == null ? '등록되었습니다.' : '수정되었습니다.');
    setIsFormOpen(false);
    await loadBindings(status);
    if (selectedId != null) await loadDetail(selectedId);
  };

  const handleDelete = async (id: number) => {
    const result = await deleteAiPromptBinding(id);
    if (!result.ok) {
      handleApiError(result.status, result.errorMessage ?? '삭제에 실패했습니다.');
      return;
    }
    setAlertMessage('삭제되었습니다.');
    setConfirmDeleteId(null);
    if (selectedId === id) {
      setSelectedId(null);
      setDetail(null);
    }
    await loadBindings(status);
  };

  const listColumns = useMemo<ColumnDef<AiPromptBindingListItem>[]>(
    () => [
      { accessorKey: 'bindingName', header: '바인딩명' },
      { accessorKey: 'domainType', header: '도메인' },
      { accessorKey: 'featureKey', header: 'Feature Key' },
      {
        accessorKey: 'isActive',
        header: '상태',
        cell: ({ row }) => (
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              row.original.isActive === 1 ? 'bg-amber/20 text-clay' : 'bg-sand/30 text-clay/50'
            }`}
          >
            {row.original.isActive === 1 ? '활성' : '비활성'}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">바인딩 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">목록에서 행을 클릭하면 상세가 표시됩니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[5fr_5fr]">
        {/* 목록 */}
        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">바인딩 목록</h2>
            <div className="flex flex-wrap items-center gap-2">
              <StatusFilterSelect value={status} onChange={setStatus} />
              <button
                type="button"
                onClick={() => loadBindings(status)}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
              >
                새 바인딩
              </button>
            </div>
          </div>

          <AdminDataTable
            data={bindings}
            columns={listColumns}
            rowKey={(row) => String(row.bindingId)}
            onRowClick={(row) => setSelectedId(row.bindingId)}
            selectedKey={selectedId != null ? String(selectedId) : null}
            emptyMessage="바인딩이 없습니다."
            maxHeightClassName="max-h-[400px]"
          />
        </section>

        {/* 상세 */}
        <section className="flex min-w-0 flex-col gap-3 rounded-xl border border-sand/60 bg-linen/60 p-3">
          <h2 className="font-semibold text-clay">상세</h2>

          {detail == null ? (
            <p className="text-xs text-clay/60">목록에서 바인딩을 선택하세요.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    detail.isActive === 1 ? 'bg-amber/20 text-clay' : 'bg-sand/30 text-clay/50'
                  }`}
                >
                  {detail.isActive === 1 ? '활성' : '비활성'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-clay/80">
                <span className="col-span-2"><strong>바인딩명:</strong> {detail.bindingName}</span>
                <span><strong>도메인:</strong> {detail.domainType}</span>
                <span><strong>Feature Key:</strong> {detail.featureKey}</span>
              </div>

              <div className="flex flex-col gap-1 text-xs text-clay/80">
                <div className="flex items-center gap-2">
                  <strong>System 템플릿:</strong>
                  <span>ID {detail.systemTemplateId}</span>
                  {detail.systemTemplateName && (
                    <span className="rounded bg-sand/40 px-2 py-0.5">{detail.systemTemplateName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <strong>User 템플릿:</strong>
                  <span>ID {detail.userTemplateId}</span>
                  {detail.userTemplateName && (
                    <span className="rounded bg-sand/40 px-2 py-0.5">{detail.userTemplateName}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <strong>Runtime Profile:</strong>
                  <span>ID {detail.runtimeProfileId}</span>
                  {detail.profileName && (
                    <span className="rounded bg-sand/40 px-2 py-0.5">{detail.profileName}</span>
                  )}
                </div>
              </div>

              {detail.description && (
                <p className="text-xs text-clay/70">{detail.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(detail)}
                  className="rounded border border-sand px-3 py-1 text-xs text-clay hover:bg-sand/30"
                >
                  수정
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDeleteId(detail.bindingId)}
                  className="rounded border border-sand px-3 py-1 text-xs text-clay/70 hover:bg-sand/30"
                >
                  삭제
                </button>
              </div>
            </>
          )}
        </section>
      </div>

      {/* 등록/수정 다이얼로그 */}
      <Dialog.Root open={isFormOpen} onOpenChange={setIsFormOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">
              {editingBinding == null ? '바인딩 등록' : '바인딩 수정'}
            </Dialog.Title>

            <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">바인딩명 <span className="text-blush">*</span></span>
                <input
                  value={form.bindingName}
                  onChange={(e) => setForm((p) => ({ ...p, bindingName: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">도메인 유형 <span className="text-blush">*</span></span>
                <input
                  value={form.domainType}
                  onChange={(e) => setForm((p) => ({ ...p, domainType: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: DIARY_AI"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Feature Key <span className="text-blush">*</span></span>
                <input
                  value={form.featureKey}
                  readOnly={editingBinding != null}
                  onChange={(e) => setForm((p) => ({ ...p, featureKey: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
                  placeholder="예: COMMENT"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">System 템플릿 ID <span className="text-blush">*</span></span>
                <input
                  type="number"
                  value={form.systemTemplateId}
                  onChange={(e) => setForm((p) => ({ ...p, systemTemplateId: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 1"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">User 템플릿 ID <span className="text-blush">*</span></span>
                <input
                  type="number"
                  value={form.userTemplateId}
                  onChange={(e) => setForm((p) => ({ ...p, userTemplateId: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 2"
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">Runtime Profile ID <span className="text-blush">*</span></span>
                <input
                  type="number"
                  value={form.runtimeProfileId}
                  onChange={(e) => setForm((p) => ({ ...p, runtimeProfileId: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  placeholder="예: 1"
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
                onClick={() => setIsFormOpen(false)}
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

      {/* 삭제 확인 */}
      <Dialog.Root open={confirmDeleteId != null} onOpenChange={(open) => { if (!open) setConfirmDeleteId(null); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">삭제 확인</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-clay/80">
              이 바인딩을 삭제하시겠습니까? (비활성 처리됩니다)
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

export default AdminAiBindingPage;
