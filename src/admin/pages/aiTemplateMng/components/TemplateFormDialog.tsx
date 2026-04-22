import * as Dialog from '@radix-ui/react-dialog';
import AdminDataTable from '@admin/components/common/AdminDataTable';
import type { ColumnDef } from '@tanstack/react-table';
import type { TemplateForm } from '../types/forms';
import type { CommonCode } from '@admin/types/comCd';
import type { AiPromptTemplateDetail, AiPromptTemplateListItem, AiPromptTemplateRelItem } from '@admin/types/aiTemplate';

type TemplateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: TemplateForm;
  setForm: React.Dispatch<React.SetStateAction<TemplateForm>>;
  editingTemplate: AiPromptTemplateListItem | null;
  editingDetail: AiPromptTemplateDetail | null;
  domainCodes: CommonCode[];
  relationColumns: ColumnDef<AiPromptTemplateRelItem>[];
  onOpenRelationDialog: () => void;
  onSave: () => Promise<void>;
};

const TemplateFormDialog = ({
  open,
  onOpenChange,
  form,
  setForm,
  editingTemplate,
  editingDetail,
  domainCodes,
  relationColumns,
  onOpenRelationDialog,
  onSave,
}: TemplateFormDialogProps) => {
  const isEditing = editingTemplate != null;
  const relationRows = editingDetail?.relations ?? [];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] flex max-h-[85vh] w-[95vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="shrink-0 text-sm font-semibold text-clay">
            {isEditing ? '템플릿 수정' : '템플릿 등록'}
          </Dialog.Title>

          <div className="mt-4 flex-1 overflow-y-auto pr-1">
            <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Template Key <span className="text-blush">*</span></span>
                <input
                  value={form.templateKey}
                  readOnly={isEditing}
                  onChange={(e) => setForm((p) => ({ ...p, templateKey: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
                  placeholder="예: DIARY_SYSTEM_ROOT"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">템플릿명 <span className="text-blush">*</span></span>
                <input
                  value={form.templateName}
                  onChange={(e) => setForm((p) => ({ ...p, templateName: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">도메인 유형 <span className="text-blush">*</span></span>
                <select
                  value={form.domainType}
                  onChange={(e) => setForm((p) => ({ ...p, domainType: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="">선택</option>
                  {domainCodes.map((c) => (
                    <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Feature Key</span>
                <input
                  value={form.featureKey}
                  onChange={(e) => setForm((p) => ({ ...p, featureKey: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Role</span>
                <select
                  value={form.templateRole}
                  onChange={(e) => setForm((p) => ({ ...p, templateRole: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="SYSTEM">SYSTEM</option>
                  <option value="USER">USER</option>
                  <option value="COMPONENT">COMPONENT</option>
                </select>
              </label>
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">Type</span>
                <select
                  value={form.templateType}
                  onChange={(e) => setForm((p) => ({ ...p, templateType: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                >
                  <option value="ROOT">ROOT</option>
                  <option value="FRAGMENT">FRAGMENT</option>
                </select>
              </label>
              {isEditing && (
                <label className="flex flex-col gap-1">
                  <span className="text-xs text-clay/80">활성 상태</span>
                  <select
                    value={String(form.isActive)}
                    onChange={(e) => setForm((p) => ({ ...p, isActive: Number(e.target.value) }))}
                    className="rounded border border-sand px-3 py-2 text-sm"
                  >
                    <option value="1">활성</option>
                    <option value="0">비활성</option>
                  </select>
                </label>
              )}
              <label className="flex flex-col gap-1">
                <span className="text-xs text-clay/80">설명</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm"
                  rows={2}
                />
              </label>
              <label className="flex flex-col gap-1 md:col-span-2">
                <span className="text-xs text-clay/80">내용 <span className="text-blush">*</span></span>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                  className="rounded border border-sand px-3 py-2 text-sm font-mono"
                  rows={10}
                  placeholder="프롬프트 내용을 입력하세요. 변수는 {{variable}} 형식으로 사용하세요."
                />
              </label>
            </div>

            {isEditing && form.templateType === 'ROOT' && editingDetail != null && (
              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-sand/60 bg-linen/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-clay">연결된 Fragment</h3>
                    <p className="text-xs text-clay/70">ROOT 템플릿에 연결된 Fragment를 수정 모달에서 바로 관리합니다.</p>
                  </div>
                  <button
                    type="button"
                    onClick={onOpenRelationDialog}
                    className="rounded bg-clay px-2 py-1 text-xs text-white"
                  >
                    Fragment 추가
                  </button>
                </div>
                <AdminDataTable
                  data={relationRows}
                  columns={relationColumns}
                  rowKey={(row) => String(row.relId)}
                  emptyMessage="연결된 Fragment가 없습니다."
                  maxHeightClassName="max-h-[240px]"
                />
              </div>
            )}
          </div>

          <div className="mt-4 flex shrink-0 justify-end gap-2 border-t border-sand/50 pt-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
            >
              취소
            </button>
            <button
              type="button"
              onClick={onSave}
              className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
            >
              저장
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default TemplateFormDialog;
