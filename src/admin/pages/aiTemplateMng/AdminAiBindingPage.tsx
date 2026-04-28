import { useMemo } from 'react';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import { AdminPageProvider, useAdminPageContext } from '@admin/context/AdminPageContext';
import { useBindingPageState } from './hooks/useBindingPageState';
import { buildBindingListColumns } from './columns/bindingColumns';
import BindingFormDialog from './components/BindingFormDialog';

const AdminAiBindingPageContent = () => {
  const { alertMessage, errorMessage, clearAlert } = useAdminPageContext();

  const {
    status,
    setStatus,
    domainFilter,
    setDomainFilter,
    bindings,
    loadBindings,
    isFormOpen,
    setIsFormOpen,
    editingBinding,
    form,
    setForm,
    domainCodes,
    systemTemplateOptions,
    userTemplateOptions,
    runtimeProfileOptions,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
  } = useBindingPageState();

  const listColumns = useMemo(
    () => buildBindingListColumns({ onEdit: handleOpenEdit }),
    [handleOpenEdit],
  );

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">바인딩 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">바인딩명 또는 수정 버튼을 눌러 바인딩 정보를 관리합니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <section className="flex min-w-0 h-[58vh] flex-col gap-3 overflow-auto rounded-xl border border-sand/60 bg-linen/60 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-clay">바인딩 목록</h2>
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
              onClick={() => loadBindings()}
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
          emptyMessage="바인딩이 없습니다."
        />
      </section>

      <BindingFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        form={form}
        setForm={setForm}
        editingBinding={editingBinding}
        domainCodes={domainCodes}
        systemTemplateOptions={systemTemplateOptions}
        userTemplateOptions={userTemplateOptions}
        runtimeProfileOptions={runtimeProfileOptions}
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

const AdminAiBindingPage = () => (
  <AdminPageProvider>
    <AdminAiBindingPageContent />
  </AdminPageProvider>
);

export default AdminAiBindingPage;
