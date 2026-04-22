import type { ColumnDef } from '@tanstack/react-table';
import type { AiPromptTemplateListItem, AiPromptTemplateRelItem } from '@admin/types/aiTemplate';

type BuildTemplateListColumnsOptions = {
  onEdit: (row: AiPromptTemplateListItem) => void;
};

export function buildTemplateListColumns({
  onEdit,
}: BuildTemplateListColumnsOptions): ColumnDef<AiPromptTemplateListItem>[] {
  return [
    { accessorKey: 'templateKey', header: 'Key' },
    {
      accessorKey: 'templateName',
      header: '템플릿명',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
          className="text-left text-clay underline-offset-2 hover:underline"
        >
          {row.original.templateName}
        </button>
      ),
    },
    { accessorKey: 'templateRole', header: 'Role' },
    { accessorKey: 'templateType', header: 'Type' },
    { accessorKey: 'domainType', header: '도메인' },
    {
      accessorKey: 'isActive',
      header: '상태',
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            row.original.isActive === 1 ? 'bg-amber/20 text-clay' : 'bg-sand/30 text-clay/50'
          }`}
        >
          {row.original.isActive === 1 ? '활성' : '비활성'}
        </span>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
          className="rounded border border-sand px-2 py-0.5 text-xs text-clay hover:bg-sand/30"
        >
          수정
        </button>
      ),
    },
  ];
}

type BuildRelationColumnsOptions = {
  onDeleteRelId: (relId: number) => void;
};

export function buildRelationColumns({
  onDeleteRelId,
}: BuildRelationColumnsOptions): ColumnDef<AiPromptTemplateRelItem>[] {
  return [
    { accessorKey: 'relId', header: 'ID' },
    { accessorKey: 'childTemplateKey', header: 'Fragment Key' },
    { accessorKey: 'childTemplateName', header: 'Fragment명' },
    { accessorKey: 'mergeType', header: '조합 방식' },
    { accessorKey: 'sortSeq', header: '순서' },
    {
      id: 'relActions',
      header: '',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteRelId(row.original.relId);
          }}
          className="rounded border border-sand px-2 py-0.5 text-xs text-clay/70 hover:bg-sand/30"
        >
          삭제
        </button>
      ),
    },
  ];
}
