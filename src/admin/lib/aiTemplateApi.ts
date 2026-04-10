import { adminFetch } from './api';
import type {
  AiRuntimeProfile,
  AiRuntimeProfileCreateRequest,
  AiRuntimeProfileUpdateRequest,
  AiPromptTemplateListItem,
  AiPromptTemplateDetail,
  AiPromptTemplateCreateRequest,
  AiPromptTemplateUpdateRequest,
  AiPromptTemplateRelCreateRequest,
  AiTemplatePreviewRequest,
  AiTemplatePreviewResponse,
  AiPromptBindingListItem,
  AiPromptBindingDetail,
  AiPromptBindingCreateRequest,
  AiPromptBindingUpdateRequest,
} from '../types/aiTemplate';

// Runtime Profile
export async function getAiRuntimeProfileList(status?: string, domainType?: string) {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (domainType) params.domainType = domainType;
  return adminFetch<AiRuntimeProfile[]>('/api/admin/ai-template/runtime-profiles', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
}

export async function createAiRuntimeProfile(req: AiRuntimeProfileCreateRequest) {
  return adminFetch('/api/admin/ai-template/runtime-profiles', {
    method: 'POST',
    data: req,
  });
}

export async function updateAiRuntimeProfile(id: number, req: AiRuntimeProfileUpdateRequest) {
  return adminFetch(`/api/admin/ai-template/runtime-profiles/${id}/update`, {
    method: 'POST',
    data: req,
  });
}

export async function deleteAiRuntimeProfile(id: number) {
  return adminFetch(`/api/admin/ai-template/runtime-profiles/${id}/delete`, {
    method: 'POST',
  });
}

// Template
export async function getAiPromptTemplateList(status?: string, templateType?: string, domainType?: string) {
  const params: Record<string, string> = {};
  if (status) params.status = status;
  if (templateType) params.templateType = templateType;
  if (domainType) params.domainType = domainType;
  return adminFetch<AiPromptTemplateListItem[]>('/api/admin/ai-template/templates', {
    params: Object.keys(params).length > 0 ? params : undefined,
  });
}

export async function getAiPromptTemplateDetail(id: number) {
  return adminFetch<AiPromptTemplateDetail>(`/api/admin/ai-template/templates/${id}`);
}

export async function createAiPromptTemplate(req: AiPromptTemplateCreateRequest) {
  return adminFetch('/api/admin/ai-template/templates', {
    method: 'POST',
    data: req,
  });
}

export async function updateAiPromptTemplate(id: number, req: AiPromptTemplateUpdateRequest) {
  return adminFetch(`/api/admin/ai-template/templates/${id}/update`, {
    method: 'POST',
    data: req,
  });
}

export async function deleteAiPromptTemplate(id: number) {
  return adminFetch(`/api/admin/ai-template/templates/${id}/delete`, {
    method: 'POST',
  });
}

export async function addTemplateRelation(parentId: number, req: AiPromptTemplateRelCreateRequest) {
  return adminFetch(`/api/admin/ai-template/templates/${parentId}/relations`, {
    method: 'POST',
    data: req,
  });
}

export async function deleteTemplateRelation(parentId: number, relId: number) {
  return adminFetch(`/api/admin/ai-template/templates/${parentId}/relations/${relId}/delete`, {
    method: 'POST',
  });
}

export async function previewTemplate(id: number, req: AiTemplatePreviewRequest) {
  return adminFetch<AiTemplatePreviewResponse>(`/api/admin/ai-template/templates/${id}/preview`, {
    method: 'POST',
    data: req,
  });
}

// Binding
export async function getAiPromptBindingList(status?: string) {
  return adminFetch<AiPromptBindingListItem[]>('/api/admin/ai-template/bindings', {
    params: status ? { status } : undefined,
  });
}

export async function getAiPromptBindingDetail(id: number) {
  return adminFetch<AiPromptBindingDetail>(`/api/admin/ai-template/bindings/${id}`);
}

export async function createAiPromptBinding(req: AiPromptBindingCreateRequest) {
  return adminFetch('/api/admin/ai-template/bindings', {
    method: 'POST',
    data: req,
  });
}

export async function updateAiPromptBinding(id: number, req: AiPromptBindingUpdateRequest) {
  return adminFetch(`/api/admin/ai-template/bindings/${id}/update`, {
    method: 'POST',
    data: req,
  });
}

export async function deleteAiPromptBinding(id: number) {
  return adminFetch(`/api/admin/ai-template/bindings/${id}/delete`, {
    method: 'POST',
  });
}
