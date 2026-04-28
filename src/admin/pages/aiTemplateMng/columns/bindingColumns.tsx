import type { ColumnDef } from '@tanstack/react-table';
import type { AiPromptBindingListItem } from '@admin/types/aiTemplate';

type BuildBindingListColumnsOptions = {
  onEdit: (row: AiPromptBindingListItem) => void;
};

export function buildBindingListColumns({
  onEdit,
}: BuildBindingListColumnsOptions): ColumnDef<AiPromptBindingListItem>[] {
  return [
    {
      accessorKey: 'bindingName',
      header: '바인딩명',
      cell: ({ row }) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(row.original);
          }}
          className="text-left text-clay underline underline-offset-2 hover:text-clay/70"
        >
          {row.original.bindingName}
        </button>
      ),
    },
    { accessorKey: 'domainType', header: '도메인' },
    { accessorKey: 'featureKey', header: 'Feature Key' },
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
  ];
}
