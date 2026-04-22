import { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import { AdminPageProvider, useAdminPageContext } from '@admin/context/AdminPageContext';
import { useTemplatePageState } from './hooks/useTemplatePageState';
import { buildTemplateListColumns, buildRelationColumns } from './columns/templateColumns';
import TemplateFormDialog from './components/TemplateFormDialog';
import FragmentRelationDialog from './components/FragmentRelationDialog';

const AdminAiTemplatePageContent = () => {
  const { alertMessage, errorMessage, clearAlert } = useAdminPageContext();
  const { filters, list, formDialog, relationDialog, setFormOpen } = useTemplatePageState();

  const listColumns = useMemo(
    () => buildTemplateListColumns({ onEdit: formDialog.handleOpenEdit }),
    [formDialog.handleOpenEdit],
  );

  const relColumns = useMemo(
    () => buildRelationColumns({ onDeleteRelId: relationDialog.setConfirmDeleteRelId }),
    [relationDialog.setConfirmDeleteRelId],
  );

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">프롬프트 템플릿 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">템플릿명 또는 수정 버튼을 눌러 템플릿 정보와 Fragment 연결을 함께 관리합니다.</p>
        </div>
      </header>

      {errorMessage && (
        <div className="rounded-md border border-blush/50 bg-blush/20 px-3 py-2 text-xs text-clay sm:text-sm">
          {errorMessage}
        </div>
      )}

      <section className="flex min-w-0 h-[58vh] flex-col gap-3 overflow-auto rounded-xl border border-sand/60 bg-linen/60 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">템플릿 목록</h2>
            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1 text-xs text-clay">
                도메인
                <select
                  value={filters.domainFilter}
                  onChange={(e) => filters.setDomainFilter(e.target.value)}
                  className="rounded border border-sand px-2 py-1 text-xs"
                >
                  <option value="">전체</option>
                  {list.domainCodes.map((c) => (
                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                  ))}
                </select>
              </label>
              <label className="flex items-center gap-1 text-xs text-clay">
                타입
                <select
                  value={filters.typeFilter}
                  onChange={(e) => filters.setTypeFilter(e.target.value)}
                  className="rounded border border-sand px-2 py-1 text-xs"
                >
                  <option value="ALL">전체</option>
                  <option value="ROOT">ROOT</option>
                  <option value="FRAGMENT">FRAGMENT</option>
                </select>
              </label>
              <StatusFilterSelect value={filters.status} onChange={filters.setStatus} />
              <button
                type="button"
                onClick={() => list.loadTemplates()}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={formDialog.handleOpenCreate}
                className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
              >
                새 템플릿
              </button>
            </div>
          </div>

          <AdminDataTable
            data={list.templates}
            columns={listColumns}
            rowKey={(row) => String(row.templateId)}
            emptyMessage="템플릿이 없습니다."
          />
        </section>

      <TemplateFormDialog
        open={formDialog.isFormOpen}
        onOpenChange={setFormOpen}
        form={formDialog.form}
        setForm={formDialog.setForm}
        editingTemplate={formDialog.editingTemplate}
        editingDetail={formDialog.editingDetail}
        domainCodes={list.domainCodes}
        relationColumns={relColumns}
        onOpenRelationDialog={() => relationDialog.setIsRelOpen(true)}
        onSave={formDialog.handleSave}
      />

      <FragmentRelationDialog
        open={relationDialog.isRelOpen}
        onOpenChange={relationDialog.setIsRelOpen}
        relForm={relationDialog.relForm}
        setRelForm={relationDialog.setRelForm}
        fragmentOptions={list.fragmentOptions}
        onAdd={relationDialog.handleAddRelation}
        isAdding={relationDialog.isAdding}
      />

      {/* Fragment 연결 삭제 확인 */}
      <Dialog.Root
        open={relationDialog.confirmDeleteRelId != null}
        onOpenChange={(open) => { if (!open) relationDialog.setConfirmDeleteRelId(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[80] bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[81] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">Fragment 연결 삭제</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-clay/80">
              이 Fragment 연결을 삭제하시겠습니까?
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => relationDialog.setConfirmDeleteRelId(null)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                disabled={relationDialog.isDeleting}
                onClick={() => {
                  if (relationDialog.confirmDeleteRelId != null) {
                    relationDialog.handleDeleteRelation(relationDialog.confirmDeleteRelId);
                  }
                }}
                className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AdminAlertDialog
        open={!!alertMessage}
        onOpenChange={(open) => { if (!open) clearAlert(); }}
        title="알림"
        description={alertMessage ?? ''}
      />
    </div>
  );
};

const AdminAiTemplatePage = () => (
  <AdminPageProvider>
    <AdminAiTemplatePageContent />
  </AdminPageProvider>
);

export default AdminAiTemplatePage;
