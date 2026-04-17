import { useEffect, useMemo, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import type { CommonCode } from '@admin/types/comCd';

type CodeSubmitPayload = {
  groupId: string;
  codeId: string;
  codeName: string;
  sortSeq: number;
  extraInfo1: string;
  extraInfo2: string;
  isActive: boolean;
};

type CodeFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedGroupId: string;
  code?: CommonCode | null;
  onSubmit: (payload: CodeSubmitPayload, mode: 'create' | 'edit') => Promise<void>;
};

const initialForm: CodeSubmitPayload = {
  groupId: '',
  codeId: '',
  codeName: '',
  sortSeq: 0,
  extraInfo1: '',
  extraInfo2: '',
  isActive: true,
};

const CodeFormDialog = ({
  open,
  onOpenChange,
  selectedGroupId,
  code,
  onSubmit,
}: CodeFormDialogProps) => {
  const [form, setForm] = useState<CodeSubmitPayload>(initialForm);

  const isCreateMode = useMemo(() => code?.groupId == null || code?.codeId == null, [code]);

  useEffect(() => {
    if (!open) return;

    if (isCreateMode) {
      setForm({
        ...initialForm,
        groupId: selectedGroupId,
      });
      return;
    }

    setForm({
      groupId: code?.groupId ?? selectedGroupId,
      codeId: code?.codeId ?? '',
      codeName: code?.codeName ?? '',
      sortSeq: code?.sortSeq ?? 0,
      extraInfo1: code?.extraInfo1 ?? '',
      extraInfo2: code?.extraInfo2 ?? '',
      isActive: code?.isActive ?? true,
    });
  }, [code, isCreateMode, open, selectedGroupId]);

  const handleSave = async () => {
    if (!form.groupId.trim() || !form.codeId.trim() || !form.codeName.trim()) {
      return;
    }

    await onSubmit(
      {
        groupId: form.groupId.trim(),
        codeId: form.codeId.trim(),
        codeName: form.codeName.trim(),
        sortSeq: Number(form.sortSeq),
        extraInfo1: form.extraInfo1,
        extraInfo2: form.extraInfo2,
        isActive: form.isActive,
      },
      isCreateMode ? 'create' : 'edit',
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">
            {isCreateMode ? '공통코드 등록' : '공통코드 수정'}
          </Dialog.Title>

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">그룹 ID</span>
              <input
                value={form.groupId}
                readOnly={!isCreateMode || !!selectedGroupId}
                onChange={(event) => setForm((prev) => ({ ...prev, groupId: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">코드 ID</span>
              <input
                value={form.codeId}
                readOnly={!isCreateMode}
                onChange={(event) => setForm((prev) => ({ ...prev, codeId: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">코드명</span>
              <input
                value={form.codeName}
                onChange={(event) => setForm((prev) => ({ ...prev, codeName: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">정렬</span>
              <input
                type="number"
                value={form.sortSeq}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, sortSeq: Number(event.target.value) }))
                }
                className="rounded border border-sand px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">추가정보1</span>
              <input
                value={form.extraInfo1}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, extraInfo1: event.target.value }))
                }
                className="rounded border border-sand px-3 py-2 text-sm"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">추가정보2</span>
              <input
                value={form.extraInfo2}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, extraInfo2: event.target.value }))
                }
                className="rounded border border-sand px-3 py-2 text-sm"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-clay md:col-span-2">
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

export default CodeFormDialog;
