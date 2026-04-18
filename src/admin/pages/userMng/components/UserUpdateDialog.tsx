import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import type { UpdateUserRequest, UserDetail } from '../types/userMng';
import {
  USER_ROLE_OPTIONS,
  USER_ROLE_LABEL,
  canEditRole,
  createUpdateUserRequest,
  isWithdrawnUser,
} from '../types/userMng';

type UserUpdateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: UserDetail | null;
  currentUserId: number | null;
  isSubmitting: boolean;
  onSubmit: (request: UpdateUserRequest) => Promise<boolean>;
};

const UserUpdateDialog = ({
  open,
  onOpenChange,
  detail,
  currentUserId,
  isSubmitting,
  onSubmit,
}: UserUpdateDialogProps) => {
  const [form, setForm] = useState<UpdateUserRequest>(createUpdateUserRequest(detail));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(createUpdateUserRequest(detail));
      setErrorMessage(null);
    }
  }, [detail, open]);

  const roleEditAllowed = detail ? canEditRole({ user: detail, currentUserId }) : true;
  const immutable = detail ? isWithdrawnUser(detail) : false;
  const trimmedNickname = form.nickname.trim();

  const handleSubmit = async () => {
    if (!detail) return;
    if (!trimmedNickname) {
      setErrorMessage('닉네임을 입력해 주세요.');
      return;
    }
    if (immutable) {
      setErrorMessage('탈퇴한 회원은 수정할 수 없습니다.');
      return;
    }

    setErrorMessage(null);
    const ok = await onSubmit({
      nickname: trimmedNickname,
      role: form.role,
    });
    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">회원 정보 수정</Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-clay/70">
            닉네임과 권한만 수정할 수 있습니다. 이메일과 loginId는 변경 대상이 아닙니다.
          </Dialog.Description>

          {errorMessage && (
            <div className="mt-3 rounded border border-blush/50 bg-blush/20 px-3 py-2 text-sm text-clay">
              {errorMessage}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs text-clay/80">이메일</span>
              <input
                value={detail?.email ?? ''}
                className="rounded border border-sand px-3 py-2 text-sm"
                readOnly
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">닉네임 <span className="text-blush">*</span></span>
              <input
                value={form.nickname}
                onChange={(event) => setForm((previous) => ({ ...previous, nickname: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
                disabled={immutable}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">로그인 ID</span>
              <input
                value={detail?.loginId ?? ''}
                className="rounded border border-sand px-3 py-2 text-sm read-only:bg-linen"
                readOnly
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs text-clay/80">권한 <span className="text-blush">*</span></span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, role: event.target.value as UpdateUserRequest['role'] }))
                }
                className="rounded border border-sand px-3 py-2 text-sm"
                disabled={immutable}
              >
                {USER_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role} disabled={!roleEditAllowed && role !== detail?.role}>
                    {USER_ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
              {!roleEditAllowed && (
                <span className="text-xs text-clay/60">본인 계정의 권한 강등은 UI에서 제한됩니다.</span>
              )}
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
              onClick={handleSubmit}
              disabled={isSubmitting || immutable}
              className="rounded bg-clay px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserUpdateDialog;
