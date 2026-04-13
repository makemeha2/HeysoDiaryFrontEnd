import * as Dialog from '@radix-ui/react-dialog';
import type { TemplateForm } from '../types/forms';
import type { CommonCode } from '@admin/types/comCd';
import type { AiPromptTemplateListItem } from '@admin/types/aiTemplate';

type TemplateFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: TemplateForm;
  setForm: React.Dispatch<React.SetStateAction<TemplateForm>>;
  editingTemplate: AiPromptTemplateListItem | null;
  domainCodes: CommonCode[];
  onSave: () => Promise<void>;
};

const TemplateFormDialog = ({
  open,
  onOpenChange,
  form,
  setForm,
  editingTemplate,
  domainCodes,
  onSave,
}: TemplateFormDialogProps) => {
  const isEditing = editingTemplate != null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">
            {isEditing ? '템플릿 수정' : '템플릿 등록'}
          </Dialog.Title>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
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
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs text-clay/80">내용 <span className="text-blush">*</span></span>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm font-mono"
                rows={8}
                placeholder="프롬프트 내용을 입력하세요. 변수는 {{variable}} 형식으로 사용하세요."
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
