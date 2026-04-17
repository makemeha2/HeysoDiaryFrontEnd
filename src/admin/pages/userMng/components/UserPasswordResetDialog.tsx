import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useState } from 'react';
import type { ResetUserPasswordForm, UserDetail } from '../types/userMng';
import {
  canResetOrDeleteUser,
  createDefaultResetPasswordForm,
} from '../types/userMng';

type UserPasswordResetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: UserDetail | null;
  isSubmitting: boolean;
  onSubmit: (request: { newPassword: string }) => Promise<boolean>;
};

const UserPasswordResetDialog = ({
  open,
  onOpenChange,
  detail,
  isSubmitting,
  onSubmit,
}: UserPasswordResetDialogProps) => {
  const [form, setForm] = useState<ResetUserPasswordForm>(createDefaultResetPasswordForm());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(createDefaultResetPasswordForm());
      setErrorMessage(null);
    }
  }, [open]);

  const localOnly = detail ? canResetOrDeleteUser(detail) : false;

  const handleSubmit = async () => {
    if (!localOnly) {
      setErrorMessage('LOCAL 계정만 비밀번호를 재설정할 수 있습니다.');
      return;
    }
    if (form.newPassword.length < 8) {
      setErrorMessage('새 비밀번호는 8자 이상이어야 합니다.');
      return;
    }
    if (form.newPassword !== form.passwordConfirm) {
      setErrorMessage('비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    setErrorMessage(null);
    const ok = await onSubmit({ newPassword: form.newPassword });
    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">비밀번호 재설정</Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-clay/70">
            {detail ? `${detail.email} 계정의 비밀번호를 새 값으로 재설정합니다.` : '비밀번호를 재설정합니다.'}
          </Dialog.Description>

          {errorMessage && (
            <div className="mt-3 rounded border border-blush/50 bg-blush/20 px-3 py-2 text-sm text-clay">
              {errorMessage}
            </div>
          )}

          {!localOnly && detail && (
            <div className="mt-3 rounded border border-amber/25 bg-amber/10 px-3 py-2 text-sm text-clay">
              LOCAL 계정만 비밀번호 재설정이 가능합니다.
            </div>
          )}

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">새 비밀번호 <span className="text-blush">*</span></span>
              <input
                type="password"
                value={form.newPassword}
                onChange={(event) => setForm((previous) => ({ ...previous, newPassword: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
                autoComplete="new-password"
                disabled={!localOnly}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">새 비밀번호 확인 <span className="text-blush">*</span></span>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(event) => setForm((previous) => ({ ...previous, passwordConfirm: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
                autoComplete="new-password"
                disabled={!localOnly}
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
              onClick={handleSubmit}
              disabled={isSubmitting || !localOnly}
              className="rounded bg-clay px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? '처리 중...' : '재설정'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserPasswordResetDialog;
