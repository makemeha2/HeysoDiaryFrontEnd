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
    selectedId,
    setSelectedId,
    detail,
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
          <p className="text-xs text-clay/80 sm:text-sm">목록에서 행을 클릭하면 상세가 표시됩니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex flex-col gap-4">
        <section
          className="flex min-w-0 flex-col gap-3 overflow-auto rounded-xl border border-sand/60 bg-linen/60 p-3"
          style={{ height: '50vh' }}
        >
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
            onRowClick={(row) => setSelectedId(row.bindingId)}
            selectedKey={selectedId != null ? String(selectedId) : null}
            emptyMessage="바인딩이 없습니다."
          />
        </section>

        <section
          className="flex min-w-0 flex-col gap-3 overflow-auto rounded-xl border border-sand/60 bg-linen/60 p-3"
          style={{ height: '50vh' }}
        >
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
            </>
          )}
        </section>
      </div>

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
