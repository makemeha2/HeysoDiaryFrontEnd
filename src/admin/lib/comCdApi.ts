import { adminFetch } from './api';
import type { CommonCode, CommonCodeGroup, StatusFilter } from '../types/comCd';

export async function fetchAdminGroupList(status: StatusFilter) {
  return adminFetch<CommonCodeGroup[]>('/api/admin/comCd/groups', {
    params: { status },
  });
}

export async function fetchAdminGroupDetail(groupId: string) {
  return adminFetch<CommonCodeGroup>(`/api/admin/comCd/groups/${groupId}`);
}

export async function createAdminGroup(payload: {
  groupId: string;
  groupName: string;
  isActive: boolean;
}) {
  return adminFetch('/api/admin/comCd/groups', {
    method: 'POST',
    data: payload,
  });
}

export async function updateAdminGroup(groupId: string, payload: { groupName: string; isActive: boolean }) {
  return adminFetch(`/api/admin/comCd/groups/${groupId}/update`, {
    method: 'POST',
    data: payload,
  });
}

export async function deleteAdminGroup(groupId: string) {
  return adminFetch(`/api/admin/comCd/groups/${groupId}/delete`, {
    method: 'POST',
  });
}

export async function fetchAdminCodeList(groupId: string, status: StatusFilter) {
  return adminFetch<CommonCode[]>(`/api/admin/comCd/groups/${groupId}/codes`, {
    params: { status },
  });
}

export async function fetchAdminCodeDetail(groupId: string, codeId: string) {
  return adminFetch<CommonCode>(`/api/admin/comCd/groups/${groupId}/codes/${codeId}`);
}

export async function createAdminCode(
  groupId: string,
  payload: {
    codeId: string;
    codeName: string;
    isActive: boolean;
    extraInfo1?: string;
    extraInfo2?: string;
    sortSeq: number;
  },
) {
  return adminFetch(`/api/admin/comCd/groups/${groupId}/codes`, {
    method: 'POST',
    data: payload,
  });
}

export async function updateAdminCode(
  groupId: string,
  codeId: string,
  payload: {
    codeName: string;
    isActive: boolean;
    extraInfo1?: string;
    extraInfo2?: string;
    sortSeq: number;
  },
) {
  return adminFetch(`/api/admin/comCd/groups/${groupId}/codes/${codeId}/update`, {
    method: 'POST',
    data: payload,
  });
}

export async function deleteAdminCode(groupId: string, codeId: string) {
  return adminFetch(`/api/admin/comCd/groups/${groupId}/codes/${codeId}/delete`, {
    method: 'POST',
  });
}
