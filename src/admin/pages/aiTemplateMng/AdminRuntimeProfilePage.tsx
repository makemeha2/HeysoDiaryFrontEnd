import { useMemo } from 'react';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import { AdminPageProvider, useAdminPageContext } from '@admin/context/AdminPageContext';
import { useRuntimeProfilePageState } from './hooks/useRuntimeProfilePageState';
import { buildRuntimeProfileColumns } from './columns/runtimeProfileColumns';
import RuntimeProfileFormDialog from './components/RuntimeProfileFormDialog';
import ModelReferenceTable from './components/ModelReferenceTable';

const AdminRuntimeProfilePageContent = () => {
  const { alertMessage, errorMessage, clearAlert } = useAdminPageContext();

  const {
    status,
    setStatus,
    domainFilter,
    setDomainFilter,
    profiles,
    loadProfiles,
    isDialogOpen,
    setIsDialogOpen,
    editingProfile,
    form,
    setForm,
    domainCodes,
    providerOptions,
    modelOptions,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
  } = useRuntimeProfilePageState();

  const columns = useMemo(
    () => buildRuntimeProfileColumns({ onEdit: handleOpenEdit }),
    [handleOpenEdit],
  );

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
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex items-center gap-1 text-xs text-clay">
              도메인
              <select
                value={domainFilter}
                onChange={(e) => setDomainFilter(e.target.value)}
                className="rounded border border-sand px-2 py-1 text-xs"
              >
                <option value="">전체</option>
                {domainCodes.map((c) => (
                  <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                ))}
              </select>
            </label>
            <StatusFilterSelect value={status} onChange={setStatus} />
            <button
              type="button"
              onClick={() => loadProfiles(status, domainFilter)}
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
          maxHeightClassName="max-h-[400px]"
        />

        <ModelReferenceTable />
      </section>

      <RuntimeProfileFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        form={form}
        setForm={setForm}
        editingProfile={editingProfile}
        domainCodes={domainCodes}
        providerOptions={providerOptions}
        modelOptions={modelOptions}
        onSave={handleSave}
      />

      <AdminAlertDialog
        open={!!alertMessage}
        onOpenChange={(open) => { if (!open) clearAlert(); }}
        title="알림"
        description={alertMessage ?? ''}
      />
    </div>
  );
};

const AdminRuntimeProfilePage = () => (
  <AdminPageProvider>
    <AdminRuntimeProfilePageContent />
  </AdminPageProvider>
);

export default AdminRuntimeProfilePage;
