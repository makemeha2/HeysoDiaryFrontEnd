import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import type { UserDetail, UserStatusMutation } from '../types/userMng';
import {
  USER_STATUS_LABEL,
  USER_STATUS_MUTATION_OPTIONS,
  isWithdrawnUser,
} from '../types/userMng';

type UserStatusDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: UserDetail | null;
  currentUserId: number | null;
  isSubmitting: boolean;
  onSubmit: (request: { status: UserStatusMutation }) => Promise<boolean>;
};

const UserStatusDialog = ({
  open,
  onOpenChange,
  detail,
  currentUserId,
  isSubmitting,
  onSubmit,
}: UserStatusDialogProps) => {
  const [status, setStatus] = useState<UserStatusMutation>('ACTIVE');

  useEffect(() => {
    if (open && detail && detail.status !== 'WITHDRAWN') {
      setStatus(detail.status);
    }
  }, [detail, open]);

  const immutable = detail ? isWithdrawnUser(detail) : false;
  const isSelf = detail != null && currentUserId != null && detail.userId === currentUserId;

  const handleSubmit = async () => {
    if (!detail || immutable) return;
    const ok = await onSubmit({ status });
    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">회원 상태 변경</Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-clay/70">
            {detail ? `${detail.email} 계정의 상태를 변경합니다.` : '회원 상태를 변경합니다.'}
          </Dialog.Description>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">변경할 상태</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as UserStatusMutation)}
                className="rounded border border-sand px-3 py-2 text-sm"
                disabled={immutable}
              >
                {USER_STATUS_MUTATION_OPTIONS.map((option) => (
                  <option key={option} value={option} disabled={isSelf && option !== 'ACTIVE'}>
                    {USER_STATUS_LABEL[option]}
                  </option>
                ))}
              </select>
            </label>
            {isSelf && (
              <p className="rounded border border-amber/25 bg-amber/10 px-3 py-2 text-xs text-clay">
                본인 계정은 ACTIVE 외 상태로 변경할 수 없습니다.
              </p>
            )}
            {immutable && (
              <p className="rounded border border-blush/25 bg-blush/10 px-3 py-2 text-xs text-clay">
                WITHDRAWN 사용자는 상태를 변경할 수 없습니다.
              </p>
            )}
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
              onClick={handleSubmit}
              disabled={isSubmitting || immutable}
              className="rounded bg-clay px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? '변경 중...' : '변경'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserStatusDialog;
