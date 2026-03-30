export type StatusFilter = 'ACTIVE' | 'INACTIVE' | 'ALL';

export type CommonCodeGroup = {
  groupId: string;
  groupName: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CommonCode = {
  groupId: string;
  codeId: string;
  codeName: string;
  isActive: boolean;
  extraInfo1?: string;
  extraInfo2?: string;
  sortSeq: number;
  createdAt?: string;
  updatedAt?: string;
};
