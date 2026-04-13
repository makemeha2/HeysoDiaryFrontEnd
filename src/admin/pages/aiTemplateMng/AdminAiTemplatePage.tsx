import { useMemo } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import StatusFilterSelect from '@admin/components/StatusFilterSelect';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import AdminAlertDialog from '@admin/components/common/dialog/AdminAlertDialog';
import { useAdminPageBase } from '@admin/hooks/useAdminPageBase';
import { useTemplatePageState } from './hooks/useTemplatePageState';
import { buildTemplateListColumns, buildRelationColumns } from './columns/templateColumns';
import TemplateFormDialog from './components/TemplateFormDialog';
import FragmentRelationDialog from './components/FragmentRelationDialog';
import TemplatePreviewDialog from './components/TemplatePreviewDialog';

const AdminAiTemplatePage = () => {
  const {
    alertMessage,
    setAlertMessage,
    errorMessage,
    setErrorMessage,
    handleApiError,
    loadComCodes,
  } = useAdminPageBase();

  const {
    status,
    setStatus,
    typeFilter,
    setTypeFilter,
    domainFilter,
    setDomainFilter,
    templates,
    loadTemplates,
    selectedId,
    setSelectedId,
    detail,
    domainCodes,
    fragmentOptions,
    isFormOpen,
    setIsFormOpen,
    editingTemplate,
    form,
    setForm,
    isRelOpen,
    setIsRelOpen,
    relForm,
    setRelForm,
    isPreviewOpen,
    setIsPreviewOpen,
    previewVars,
    setPreviewVars,
    previewResult,
    previewError,
    confirmDeleteRelId,
    setConfirmDeleteRelId,
    handleOpenCreate,
    handleOpenEdit,
    handleSave,
    handleAddRelation,
    handleDeleteRelation,
    handlePreview,
  } = useTemplatePageState({ handleApiError, setAlertMessage, setErrorMessage, loadComCodes });

  const listColumns = useMemo(
    () => buildTemplateListColumns({ onEdit: handleOpenEdit }),
    [handleOpenEdit],
  );

  const relColumns = useMemo(
    () => buildRelationColumns({ onDeleteRelId: setConfirmDeleteRelId }),
    [setConfirmDeleteRelId],
  );

  return (
    <div className="flex w-full flex-col gap-4 text-sm">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-clay sm:text-xl">프롬프트 템플릿 관리</h1>
          <p className="text-xs text-clay/80 sm:text-sm">템플릿 목록에서 행을 클릭하면 상세가 표시됩니다.</p>
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
          style={{ height: '40vh' }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold text-clay">템플릿 목록</h2>
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
              <label className="flex items-center gap-1 text-xs text-clay">
                타입
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="rounded border border-sand px-2 py-1 text-xs"
                >
                  <option value="ALL">전체</option>
                  <option value="ROOT">ROOT</option>
                  <option value="FRAGMENT">FRAGMENT</option>
                </select>
              </label>
              <StatusFilterSelect value={status} onChange={setStatus} />
              <button
                type="button"
                onClick={() => loadTemplates(status, typeFilter, domainFilter)}
                className="rounded border border-sand px-2 py-1 text-xs text-clay sm:text-sm"
              >
                새로고침
              </button>
              <button
                type="button"
                onClick={handleOpenCreate}
                className="rounded bg-clay px-2 py-1 text-xs text-white sm:text-sm"
              >
                새 템플릿
              </button>
            </div>
          </div>

          <AdminDataTable
            data={templates}
            columns={listColumns}
            rowKey={(row) => String(row.templateId)}
            onRowClick={(row) => setSelectedId(row.templateId)}
            selectedKey={selectedId != null ? String(selectedId) : null}
            emptyMessage="템플릿이 없습니다."
          />
        </section>

        <section
          className="flex min-w-0 flex-col gap-3 overflow-auto rounded-xl border border-sand/60 bg-linen/60 p-3"
          style={{ height: '60vh' }}
        >
          <h2 className="font-semibold text-clay">상세</h2>

          {detail == null ? (
            <p className="text-xs text-clay/60">목록에서 템플릿을 선택하세요.</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-sand/40 px-2 py-0.5 text-xs text-clay">{detail.templateRole}</span>
                <span className="rounded-full bg-sand/40 px-2 py-0.5 text-xs text-clay">{detail.templateType}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    detail.isActive === 1 ? 'bg-amber/20 text-clay' : 'bg-sand/30 text-clay/50'
                  }`}
                >
                  {detail.isActive === 1 ? '활성' : '비활성'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-clay/80">
                <span><strong>Key:</strong> {detail.templateKey}</span>
                <span><strong>도메인:</strong> {detail.domainType}</span>
                <span><strong>Feature:</strong> {detail.featureKey ?? '-'}</span>
                <span><strong>Revision:</strong> {detail.revisionNo}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-clay/70">내용</span>
                <pre className="max-h-48 overflow-auto rounded border border-sand/60 bg-white p-2 text-xs text-clay whitespace-pre-wrap break-all">
                  {detail.content}
                </pre>
              </div>

              {detail.description && (
                <p className="text-xs text-clay/70">{detail.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewVars('{}');
                    setIsPreviewOpen(true);
                  }}
                  className="rounded border border-amber/60 bg-amber/10 px-3 py-1 text-xs text-clay hover:bg-amber/20"
                >
                  미리보기
                </button>
              </div>

              {detail.templateType === 'ROOT' && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-clay">연결된 Fragment</span>
                    <button
                      type="button"
                      onClick={() => setIsRelOpen(true)}
                      className="rounded bg-clay px-2 py-0.5 text-xs text-white"
                    >
                      Fragment 추가
                    </button>
                  </div>
                  <AdminDataTable
                    data={detail.relations}
                    columns={relColumns}
                    rowKey={(row) => String(row.relId)}
                    emptyMessage="연결된 Fragment가 없습니다."
                    maxHeightClassName="max-h-[200px]"
                  />
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <TemplateFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        form={form}
        setForm={setForm}
        editingTemplate={editingTemplate}
        domainCodes={domainCodes}
        onSave={handleSave}
      />

      <FragmentRelationDialog
        open={isRelOpen}
        onOpenChange={setIsRelOpen}
        relForm={relForm}
        setRelForm={setRelForm}
        fragmentOptions={fragmentOptions}
        onAdd={handleAddRelation}
      />

      <TemplatePreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        previewVars={previewVars}
        setPreviewVars={setPreviewVars}
        previewResult={previewResult}
        previewError={previewError}
        onPreview={handlePreview}
      />

      {/* Fragment 연결 삭제 확인 */}
      <Dialog.Root
        open={confirmDeleteRelId != null}
        onOpenChange={(open) => { if (!open) setConfirmDeleteRelId(null); }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
            <Dialog.Title className="text-sm font-semibold text-clay">Fragment 연결 삭제</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-clay/80">
              이 Fragment 연결을 삭제하시겠습니까?
            </Dialog.Description>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteRelId(null)}
                className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteRelId != null && handleDeleteRelation(confirmDeleteRelId)}
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

export default AdminAiTemplatePage;
