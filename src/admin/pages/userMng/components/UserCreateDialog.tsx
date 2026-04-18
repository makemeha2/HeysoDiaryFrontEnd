import * as Dialog from '@radix-ui/react-dialog';
import { useEffect, useMemo, useState } from 'react';
import type { CreateLocalUserForm } from '../types/userMng';
import {
  USER_ROLE_OPTIONS,
  USER_ROLE_LABEL,
  createDefaultCreateLocalUserForm,
} from '../types/userMng';

type UserCreateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  onSubmit: (form: Omit<CreateLocalUserForm, 'passwordConfirm'>) => Promise<boolean>;
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserCreateDialog = ({
  open,
  onOpenChange,
  isSubmitting,
  onSubmit,
}: UserCreateDialogProps) => {
  const [form, setForm] = useState<CreateLocalUserForm>(createDefaultCreateLocalUserForm());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setForm(createDefaultCreateLocalUserForm());
      setErrorMessage(null);
    }
  }, [open]);

  const trimmedForm = useMemo(
    () => ({
      ...form,
      email: form.email.trim(),
      nickname: form.nickname.trim(),
      loginId: form.loginId.trim(),
    }),
    [form],
  );

  const validate = () => {
    if (!emailRegex.test(trimmedForm.email)) return '이메일 형식을 확인해 주세요.';
    if (trimmedForm.loginId.length < 4) return '로그인 ID는 4자 이상이어야 합니다.';
    if (!trimmedForm.nickname) return '닉네임을 입력해 주세요.';
    if (trimmedForm.password.length < 8) return '비밀번호는 8자 이상이어야 합니다.';
    if (trimmedForm.password !== form.passwordConfirm) return '비밀번호 확인이 일치하지 않습니다.';
    return null;
  };

  const handleSubmit = async () => {
    const validationMessage = validate();
    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    setErrorMessage(null);
    const { passwordConfirm: _passwordConfirm, ...request } = trimmedForm;
    const ok = await onSubmit(request);
    if (ok) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-lg border border-sand/60 bg-white p-4 shadow-xl">
          <Dialog.Title className="text-sm font-semibold text-clay">신규 LOCAL 회원 등록</Dialog.Title>
          <Dialog.Description className="mt-1 text-xs text-clay/70">
            관리자 페이지에서 LOCAL 계정만 직접 생성할 수 있습니다.
          </Dialog.Description>

          {errorMessage && (
            <div className="mt-3 rounded border border-blush/50 bg-blush/20 px-3 py-2 text-sm text-clay">
              {errorMessage}
            </div>
          )}

          <div className="mt-4 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs text-clay/80">이메일 <span className="text-blush">*</span></span>
              <input
                value={form.email}
                onChange={(event) => setForm((previous) => ({ ...previous, email: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
                placeholder="user@example.com"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">닉네임 <span className="text-blush">*</span></span>
              <input
                value={form.nickname}
                onChange={(event) => setForm((previous) => ({ ...previous, nickname: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">권한 <span className="text-blush">*</span></span>
              <select
                value={form.role}
                onChange={(event) =>
                  setForm((previous) => ({ ...previous, role: event.target.value as CreateLocalUserForm['role'] }))
                }
                className="rounded border border-sand px-3 py-2 text-sm"
              >
                {USER_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {USER_ROLE_LABEL[role]}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">로그인 ID <span className="text-blush">*</span></span>
              <input
                value={form.loginId}
                onChange={(event) => setForm((previous) => ({ ...previous, loginId: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
                autoComplete="username"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-clay/80">비밀번호 <span className="text-blush">*</span></span>
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((previous) => ({ ...previous, password: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
                autoComplete="new-password"
              />
            </label>

            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-xs text-clay/80">비밀번호 확인 <span className="text-blush">*</span></span>
              <input
                type="password"
                value={form.passwordConfirm}
                onChange={(event) => setForm((previous) => ({ ...previous, passwordConfirm: event.target.value }))}
                className="rounded border border-sand px-3 py-2 text-sm"
                autoComplete="new-password"
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
              disabled={isSubmitting}
              className="rounded bg-clay px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
            >
              {isSubmitting ? '등록 중...' : '등록'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserCreateDialog;
