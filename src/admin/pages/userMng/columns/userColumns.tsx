import type { ColumnDef } from '@tanstack/react-table';
import type { UserListItem } from '../types/userMng';
import {
  USER_AUTH_PROVIDER_LABEL,
  USER_ROLE_LABEL,
  USER_STATUS_LABEL,
  canResetOrDeleteUser,
  isWithdrawnUser,
} from '../types/userMng';

type BuildUserColumnsOptions = {
  currentUserId: number | null;
  onOpenDetail: (user: UserListItem) => void;
  onOpenUpdate: (user: UserListItem) => void;
  onOpenStatus: (user: UserListItem) => void;
  onOpenPassword: (user: UserListItem) => void;
  onOpenDelete: (user: UserListItem) => void;
};

const renderText = (value: string | number | null | undefined) => value ?? '-';

const ActionButton = ({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={(event) => {
      event.stopPropagation();
      if (!disabled) {
        onClick();
      }
    }}
    disabled={disabled}
    className="rounded border border-sand px-2 py-1 text-[11px] text-clay disabled:cursor-not-allowed disabled:opacity-40"
  >
    {label}
  </button>
);

export function buildUserColumns({
  currentUserId,
  onOpenDetail,
  onOpenUpdate,
  onOpenStatus,
  onOpenPassword,
  onOpenDelete,
}: BuildUserColumnsOptions): ColumnDef<UserListItem>[] {
  return [
    { accessorKey: 'userId', header: 'userId' },
    {
      accessorKey: 'email',
      header: 'email',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onOpenDetail(row.original);
          }}
          className="min-w-[180px] text-left font-medium text-clay underline-offset-2 hover:underline"
        >
          {row.original.email}
        </button>
      ),
    },
    {
      accessorKey: 'nickname',
      header: 'nickname',
      cell: ({ row }) => <span className="min-w-[120px]">{renderText(row.original.nickname)}</span>,
    },
    {
      accessorKey: 'role',
      header: 'role',
      cell: ({ row }) => USER_ROLE_LABEL[row.original.role] ?? row.original.role,
    },
    {
      accessorKey: 'status',
      header: 'status',
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            row.original.status === 'ACTIVE'
              ? 'bg-amber/20 text-clay'
              : row.original.status === 'WITHDRAWN'
                ? 'bg-blush/15 text-clay/80'
                : 'bg-sand/40 text-clay/70'
          }`}
        >
          {USER_STATUS_LABEL[row.original.status] ?? row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'authProvider',
      header: 'authProvider',
      cell: ({ row }) =>
        USER_AUTH_PROVIDER_LABEL[row.original.authProvider as keyof typeof USER_AUTH_PROVIDER_LABEL] ??
        row.original.authProvider,
    },
    {
      accessorKey: 'loginId',
      header: 'loginId',
      cell: ({ row }) => renderText(row.original.loginId),
    },
    {
      accessorKey: 'lastLoginAt',
      header: 'lastLoginAt',
      cell: ({ row }) => <span className="whitespace-nowrap">{renderText(row.original.lastLoginAt)}</span>,
    },
    {
      accessorKey: 'createdAt',
      header: 'createdAt',
      cell: ({ row }) => <span className="whitespace-nowrap">{renderText(row.original.createdAt)}</span>,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const user = row.original;
        const immutable = isWithdrawnUser(user);
        const localOnly = canResetOrDeleteUser(user);
        const isSelf = currentUserId != null && currentUserId === user.userId;

        return (
          <div className="flex min-w-[300px] flex-wrap gap-1">
            <ActionButton label="상세" onClick={() => onOpenDetail(user)} />
            <ActionButton label="수정" disabled={immutable} onClick={() => onOpenUpdate(user)} />
            <ActionButton label="상태변경" disabled={immutable} onClick={() => onOpenStatus(user)} />
            <ActionButton label="비밀번호" disabled={!localOnly || immutable} onClick={() => onOpenPassword(user)} />
            <ActionButton label="삭제" disabled={!localOnly || immutable || isSelf} onClick={() => onOpenDelete(user)} />
          </div>
        );
      },
    },
  ];
}
