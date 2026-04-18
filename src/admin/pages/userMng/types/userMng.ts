export const USER_PAGE_SIZE = 20;

export const USER_ROLE_OPTIONS = ['ADMIN', 'MEMBER'] as const;
export const USER_STATUS_FILTER_OPTIONS = ['ACTIVE', 'INACTIVE', 'BLOCKED', 'WITHDRAWN'] as const;
export const USER_STATUS_MUTATION_OPTIONS = ['ACTIVE', 'INACTIVE', 'BLOCKED'] as const;
export const USER_AUTH_PROVIDER_OPTIONS = ['LOCAL', 'GOOGLE', 'NAVER'] as const;

export type UserRole = (typeof USER_ROLE_OPTIONS)[number];
export type UserStatus = (typeof USER_STATUS_FILTER_OPTIONS)[number];
export type UserStatusMutation = (typeof USER_STATUS_MUTATION_OPTIONS)[number];
export type UserAuthProvider = (typeof USER_AUTH_PROVIDER_OPTIONS)[number];

export type UserListItem = {
  userId: number;
  email: string;
  nickname: string;
  role: UserRole;
  status: UserStatus;
  authProvider: UserAuthProvider | string;
  loginId: string | null;
  lastLoginAt: string | null;
  createdAt: string;
};

export type UserDetail = UserListItem & {
  userAuthId: number | null;
  providerUserId: string | null;
  updatedAt: string | null;
};

export type UserPageResponse = {
  items: UserListItem[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

export type UserSearchForm = {
  keyword: string;
  role: '' | UserRole;
  status: '' | UserStatus;
  authProvider: '' | UserAuthProvider;
};

export type UserSearchParams = UserSearchForm & {
  page: number;
  size: number;
};

export type CreateLocalUserRequest = {
  email: string;
  nickname: string;
  loginId: string;
  password: string;
  role: UserRole;
};

export type UpdateUserRequest = {
  nickname: string;
  role: UserRole;
};

export type UpdateUserStatusRequest = {
  status: UserStatusMutation;
};

export type ResetUserPasswordRequest = {
  newPassword: string;
};

export type CreateLocalUserForm = CreateLocalUserRequest & {
  passwordConfirm: string;
};

export type ResetUserPasswordForm = {
  newPassword: string;
  passwordConfirm: string;
};

export const USER_ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: '관리자',
  MEMBER: '일반회원',
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: '활성',
  INACTIVE: '비활성',
  BLOCKED: '차단',
  WITHDRAWN: '탈퇴',
};

export const USER_AUTH_PROVIDER_LABEL: Record<UserAuthProvider, string> = {
  LOCAL: 'LOCAL',
  GOOGLE: 'GOOGLE',
  NAVER: 'NAVER',
};

export const USER_CONFLICT_MESSAGE_MAP: Record<string, string> = {
  EMAIL_DUPLICATED: '이미 사용 중인 이메일입니다.',
  LOGIN_ID_DUPLICATED: '이미 사용 중인 로그인 ID입니다.',
  CANNOT_DEMOTE_SELF: '본인 계정의 권한은 낮출 수 없습니다.',
  CANNOT_DEACTIVATE_SELF: '본인 계정은 ACTIVE 외 상태로 변경할 수 없습니다.',
  CANNOT_DELETE_SELF: '본인 계정은 삭제할 수 없습니다.',
  LAST_ADMIN_PROTECTED: '마지막 ACTIVE 관리자 계정은 변경하거나 삭제할 수 없습니다.',
  ONLY_LOCAL_ALLOWED: 'LOCAL 계정만 처리할 수 있습니다.',
  WITHDRAWN_USER_IMMUTABLE: '탈퇴한 회원은 수정할 수 없습니다.',
};

export function createDefaultUserSearchForm(): UserSearchForm {
  return {
    keyword: '',
    role: '',
    status: '',
    authProvider: '',
  };
}

export function createDefaultCreateLocalUserForm(): CreateLocalUserForm {
  return {
    email: '',
    nickname: '',
    loginId: '',
    password: '',
    passwordConfirm: '',
    role: 'MEMBER',
  };
}

export function createDefaultResetPasswordForm(): ResetUserPasswordForm {
  return {
    newPassword: '',
    passwordConfirm: '',
  };
}

export function createUpdateUserRequest(detail: UserDetail | null): UpdateUserRequest {
  return {
    nickname: detail?.nickname ?? '',
    role: detail?.role ?? 'MEMBER',
  };
}

export function canResetOrDeleteUser(user: Pick<UserListItem, 'authProvider'>) {
  return user.authProvider === 'LOCAL';
}

export function isWithdrawnUser(user: Pick<UserListItem, 'status'>) {
  return user.status === 'WITHDRAWN';
}

export function canEditRole({
  user,
  currentUserId,
}: {
  user: Pick<UserListItem, 'userId' | 'role'>;
  currentUserId: number | null;
}) {
  if (currentUserId == null) return true;
  if (currentUserId !== user.userId) return true;
  return user.role === 'MEMBER';
}
