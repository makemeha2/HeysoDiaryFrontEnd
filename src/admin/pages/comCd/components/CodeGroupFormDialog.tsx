import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { CommonCodeGroup } from '@admin/types/comCd';

type GroupSubmitPayload = {
  groupId: string;
  groupName: string;
  isActive: boolean;
};

type CodeGroupFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: CommonCodeGroup | null;
  onSubmit: (payload: GroupSubmitPayload, mode: 'create' | 'edit') => Promise<void>;
};

const initialForm: GroupSubmitPayload = {
  groupId: '',
  groupName: '',
  isActive: true,
};

const CodeGroupFormDialog = ({ open, onOpenChange, group, onSubmit }: CodeGroupFormDialogProps) => {
  const [form, setForm] = useState<GroupSubmitPayload>(initialForm);

  const isCreateMode = useMemo(() => group?.groupId == null, [group?.groupId]);

  useEffect(() => {
    if (!open) return;
    if (isCreateMode) {
      setForm(initialForm);
      return;
    }

    setForm({
      groupId: group?.groupId ?? '',
      groupName: group?.groupName ?? '',
      isActive: group?.isActive ?? true,
    });
  }, [group, isCreateMode, open]);

  const handleSave = async () => {
    if (!form.groupId.trim() || !form.groupName.trim()) {
      return;
    }

    await onSubmit(
      {
        groupId: form.groupId.trim(),
        groupName: form.groupName.trim(),
        isActive: form.isActive,
      },
      isCreateMode ? 'create' : 'edit',
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">
            {isCreateMode ? '공통코드그룹 등록' : '공통코드그룹 수정'}
          </Dialog.Title>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">그룹 ID</span>
              <input
                value={form.groupId}
                readOnly={!isCreateMode}
                onChange={(event) => setForm((prev) => ({ ...prev, groupId: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">그룹명</span>
              <input
                value={form.groupName}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, groupName: event.target.value }))
                }
                className="rounded border border-sand px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-clay">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, isActive: event.target.checked }))
                }
              />
              활성
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
              onClick={handleSave}
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

export default CodeGroupFormDialog;
