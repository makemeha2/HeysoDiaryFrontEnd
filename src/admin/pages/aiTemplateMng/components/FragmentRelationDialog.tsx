import * as Dialog from '@radix-ui/react-dialog';
import type { RelForm } from '../types/forms';
import type { AiPromptTemplateListItem } from '@admin/types/aiTemplate';

type FragmentRelationDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  relForm: RelForm;
  setRelForm: React.Dispatch<React.SetStateAction<RelForm>>;
  fragmentOptions: AiPromptTemplateListItem[];
  onAdd: () => Promise<void>;
};

const FragmentRelationDialog = ({
  open,
  onOpenChange,
  relForm,
  setRelForm,
  fragmentOptions,
  onAdd,
}: FragmentRelationDialogProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">Fragment 추가</Dialog.Title>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">Fragment 템플릿 <span className="text-blush">*</span></span>
              <select
                value={relForm.childTemplateId === '' ? '' : String(relForm.childTemplateId)}
                onChange={(e) =>
                  setRelForm((p) => ({
                    ...p,
                    childTemplateId: e.target.value === '' ? '' : Number(e.target.value),
                  }))
                }
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                <option value="">선택</option>
                {fragmentOptions.map((t) => (
                  <option key={t.templateId} value={String(t.templateId)}>
                    {t.templateKey} — {t.templateName}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">조합 방식</span>
              <select
                value={relForm.mergeType}
                onChange={(e) => setRelForm((p) => ({ ...p, mergeType: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                <option value="APPEND">APPEND</option>
                <option value="PREPEND">PREPEND</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">정렬 순서</span>
              <input
                type="number"
                value={relForm.sortSeq}
                onChange={(e) => setRelForm((p) => ({ ...p, sortSeq: e.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
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
              onClick={onAdd}
              className="rounded bg-clay px-3 py-1.5 text-xs text-white sm:text-sm"
            >
              추가
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default FragmentRelationDialog;
