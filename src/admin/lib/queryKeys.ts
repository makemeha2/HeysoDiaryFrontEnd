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

type MonitoringPageFilter = {
  startDate?: string;
  endDate?: string;
  resolvedYn?: string;
  eventType?: string;
  severity?: string;
  keyword?: string;
  page?: number;
};

type UserPageFilter = {
  keyword?: string;
  role?: string;
  status?: string;
  authProvider?: string;
  page?: number;
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

  monitoring: {
    page: (filter: MonitoringPageFilter) => ['admin', 'monitoring', 'page', filter] as const,
    detail: (eventId: number) => ['admin', 'monitoring', 'detail', eventId] as const,
  },

  user: {
    all: () => ['admin', 'user'] as const,
    page: (filter: UserPageFilter) => ['admin', 'user', 'page', filter] as const,
    detail: (userId: number) => ['admin', 'user', 'detail', userId] as const,
  },
} as const;
