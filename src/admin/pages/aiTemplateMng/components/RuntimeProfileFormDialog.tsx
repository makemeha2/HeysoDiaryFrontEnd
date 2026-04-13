import * as Dialog from '@radix-ui/react-dialog';
import type { ProfileForm } from '../types/forms';
import type { CommonCode } from '@admin/types/comCd';
import type { AiRuntimeProfile } from '@admin/types/aiTemplate';

type RuntimeProfileFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: ProfileForm;
  setForm: React.Dispatch<React.SetStateAction<ProfileForm>>;
  editingProfile: AiRuntimeProfile | null;
  domainCodes: CommonCode[];
  providerOptions: string[];
  modelOptions: CommonCode[];
  onSave: () => Promise<void>;
};

const RuntimeProfileFormDialog = ({
  open,
  onOpenChange,
  form,
  setForm,
  editingProfile,
  domainCodes,
  providerOptions,
  modelOptions,
  onSave,
}: RuntimeProfileFormDialogProps) => {
  const isCreateMode = editingProfile == null;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
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
              <span className="text-xs text-clay/80">Provider</span>
              <select
                value={form.provider}
                onChange={(e) => setForm((p) => ({ ...p, provider: e.target.value, model: '' }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                <option value="">선택 안함</option>
                {providerOptions.map((pv) => (
                  <option key={pv} value={pv}>{pv}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs text-clay/80">모델 <span className="text-blush">*</span></span>
              <select
                value={form.model}
                onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                <option value="">선택</option>
                {modelOptions.map((c) => (
                  <option key={c.codeId} value={c.codeId}>{c.codeName}</option>
                ))}
              </select>
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
            {!isCreateMode && (
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

export default RuntimeProfileFormDialog;
