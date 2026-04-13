import * as Dialog from '@radix-ui/react-dialog';
import type { BindingForm } from '../types/forms';
import type { CommonCode } from '@admin/types/comCd';
import type { AiPromptBindingListItem, AiPromptTemplateListItem, AiRuntimeProfile } from '@admin/types/aiTemplate';

type BindingFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: BindingForm;
  setForm: React.Dispatch<React.SetStateAction<BindingForm>>;
  editingBinding: AiPromptBindingListItem | null;
  domainCodes: CommonCode[];
  systemTemplateOptions: AiPromptTemplateListItem[];
  userTemplateOptions: AiPromptTemplateListItem[];
  runtimeProfileOptions: AiRuntimeProfile[];
  onSave: () => Promise<void>;
};

const BindingFormDialog = ({
  open,
  onOpenChange,
  form,
  setForm,
  editingBinding,
  domainCodes,
  systemTemplateOptions,
  userTemplateOptions,
  runtimeProfileOptions,
  onSave,
}: BindingFormDialogProps) => {
  const isEditing = editingBinding != null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-4xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">
            {isEditing ? '바인딩 수정' : '바인딩 등록'}
          </Dialog.Title>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-3">
            <label className="flex flex-col gap-1 md:col-span-3">
              <span className="text-xs text-clay/80">바인딩명 <span className="text-blush">*</span></span>
              <input
                value={form.bindingName}
                onChange={(e) => setForm((p) => ({ ...p, bindingName: e.target.value }))}
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
              <span className="text-xs text-clay/80">Feature Key <span className="text-blush">*</span></span>
              <input
                value={form.featureKey}
                readOnly={isEditing}
                onChange={(e) => setForm((p) => ({ ...p, featureKey: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
                placeholder="예: COMMENT"
              />
            </label>
            <div />
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">System 템플릿 <span className="text-blush">*</span></span>
              <select
                value={form.systemTemplateId}
                onChange={(e) => setForm((p) => ({ ...p, systemTemplateId: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                <option value="">선택</option>
                {systemTemplateOptions.map((t) => (
                  <option key={t.templateId} value={String(t.templateId)}>
                    {t.templateKey} — {t.templateName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">User 템플릿 <span className="text-blush">*</span></span>
              <select
                value={form.userTemplateId}
                onChange={(e) => setForm((p) => ({ ...p, userTemplateId: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                <option value="">선택</option>
                {userTemplateOptions.map((t) => (
                  <option key={t.templateId} value={String(t.templateId)}>
                    {t.templateKey} — {t.templateName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">Runtime Profile <span className="text-blush">*</span></span>
              <select
                value={form.runtimeProfileId}
                onChange={(e) => setForm((p) => ({ ...p, runtimeProfileId: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                <option value="">선택</option>
                {runtimeProfileOptions.map((p) => (
                  <option key={p.runtimeProfileId} value={String(p.runtimeProfileId)}>
                    {p.profileKey} — {p.profileName}
                  </option>
                ))}
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
            <label className="flex flex-col gap-1 md:col-span-3">
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

export default BindingFormDialog;
