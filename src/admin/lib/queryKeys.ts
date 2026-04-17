import type { StatusFilter } from '../types/comCd';

type AiListFilter = {
  status?: StatusFilter;
  type?: string;
  domain?: string;
};

type AiBindingFilter = {
  status?: StatusFilter;
  domain?: string;
};

export const adminKeys = {
  all: ['admin'] as const,

  comCd: {
    all: () => ['admin', 'comCd'] as const,
    groups: (status: StatusFilter) => ['admin', 'comCd', 'groups', { status }] as const,
    codes: (groupId: string, status: StatusFilter) =>
      ['admin', 'comCd', 'codes', groupId, { status }] as const,
    codesByGroup: (groupId: string) => ['admin', 'comCd', 'codesByGroup', groupId] as const,
  },

  ai: {
    all: () => ['admin', 'ai'] as const,
    template: {
      list: (filter: AiListFilter) => ['admin', 'ai', 'template', 'list', filter] as const,
      detail: (templateId: number) => ['admin', 'ai', 'template', 'detail', templateId] as const,
      fragmentOptions: () => ['admin', 'ai', 'template', 'fragmentOptions'] as const,
    },
    binding: {
      list: (filter: AiBindingFilter) => ['admin', 'ai', 'binding', 'list', filter] as const,
      detail: (bindingId: number) => ['admin', 'ai', 'binding', 'detail', bindingId] as const,
    },
    profile: {
      list: (filter: AiBindingFilter) => ['admin', 'ai', 'profile', 'list', filter] as const,
    },
  },
} as const;
