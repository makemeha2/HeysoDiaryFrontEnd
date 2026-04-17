import * as Dialog from '@radix-ui/react-dialog';
import type { UserDetail } from '../types/userMng';
import { USER_AUTH_PROVIDER_LABEL, USER_ROLE_LABEL, USER_STATUS_LABEL } from '../types/userMng';

const DetailRow = ({ label, value }: { label: string; value: string | null | number }) => (
  <div className="grid gap-1 border-b border-sand/40 py-2">
    <dt className="text-xs font-semibold uppercase tracking-wide text-clay/60">{label}</dt>
    <dd className="text-sm text-clay">{value ?? '-'}</dd>
  </div>
);

type UserDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: UserDetail | null;
  isLoading: boolean;
};

const UserDetailModal = ({
  open,
  onOpenChange,
  detail,
  isLoading,
}: UserDetailModalProps) => {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] flex h-[88vh] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-sand/60 bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-sand/50 pb-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-clay">회원 상세</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-clay/70">
                {detail ? `userId ${detail.userId} · ${detail.email}` : '선택한 회원의 상세 정보를 확인합니다.'}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-md border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
              >
                닫기
              </button>
            </Dialog.Close>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-lg bg-linen/30 p-4">
            {isLoading ? (
              <p className="text-sm text-clay/70">상세 정보를 불러오는 중입니다.</p>
            ) : !detail ? (
              <p className="text-sm text-clay/70">선택한 회원의 상세 정보를 불러오지 못했습니다.</p>
            ) : (
              <dl>
                <DetailRow label="user_auth_id" value={detail.userAuthId} />
                <DetailRow label="email" value={detail.email} />
                <DetailRow label="nickname" value={detail.nickname} />
                <DetailRow label="role" value={USER_ROLE_LABEL[detail.role] ?? detail.role} />
                <DetailRow label="status" value={USER_STATUS_LABEL[detail.status] ?? detail.status} />
                <DetailRow
                  label="auth_provider"
                  value={USER_AUTH_PROVIDER_LABEL[detail.authProvider as keyof typeof USER_AUTH_PROVIDER_LABEL] ?? detail.authProvider}
                />
                <DetailRow label="login_id" value={detail.loginId} />
                <DetailRow label="provider_user_id" value={detail.providerUserId} />
                <DetailRow label="created_at" value={detail.createdAt} />
                <DetailRow label="updated_at" value={detail.updatedAt} />
                <DetailRow label="last_login_at" value={detail.lastLoginAt} />
              </dl>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default UserDetailModal;
