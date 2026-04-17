import { adminFetch } from './api';
import type {
  CreateLocalUserRequest,
  ResetUserPasswordRequest,
  UpdateUserRequest,
  UpdateUserStatusRequest,
  UserDetail,
  UserPageResponse,
  UserSearchParams,
} from '@admin/pages/userMng/types/userMng';

export async function getUserPage(params: UserSearchParams) {
  const queryParams: Record<string, string | number> = {
    page: params.page,
    size: params.size,
  };

  if (params.keyword) queryParams.keyword = params.keyword;
  if (params.role) queryParams.role = params.role;
  if (params.status) queryParams.status = params.status;
  if (params.authProvider) queryParams.authProvider = params.authProvider;

  return adminFetch<UserPageResponse>('/api/admin/users', { params: queryParams });
}

export async function getUserDetail(userId: number) {
  return adminFetch<UserDetail>(`/api/admin/users/${userId}`);
}

export async function createLocalUser(request: CreateLocalUserRequest) {
  return adminFetch<UserDetail>('/api/admin/users', {
    method: 'POST',
    data: request,
  });
}

export async function updateUser(userId: number, request: UpdateUserRequest) {
  return adminFetch<UserDetail>(`/api/admin/users/${userId}/update`, {
    method: 'POST',
    data: request,
  });
}

export async function updateUserStatus(userId: number, request: UpdateUserStatusRequest) {
  return adminFetch<UserDetail>(`/api/admin/users/${userId}/status`, {
    method: 'POST',
    data: request,
  });
}

export async function resetUserPassword(userId: number, request: ResetUserPasswordRequest) {
  return adminFetch(`/api/admin/users/${userId}/password`, {
    method: 'POST',
    data: request,
  });
}

export async function deleteUser(userId: number) {
  return adminFetch(`/api/admin/users/${userId}/delete`, {
    method: 'POST',
  });
}
