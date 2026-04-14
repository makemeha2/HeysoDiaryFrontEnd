import type { ColumnDef } from '@tanstack/react-table';
import type { AiRuntimeProfile } from '@admin/types/aiTemplate';

type BuildRuntimeProfileColumnsOptions = {
  onEdit: (row: AiRuntimeProfile) => void;
};

export function buildRuntimeProfileColumns({
  onEdit,
}: BuildRuntimeProfileColumnsOptions): ColumnDef<AiRuntimeProfile>[] {
  return [
    { accessorKey: 'profileKey', header: 'Profile Key' },
    { accessorKey: 'profileName', header: '프로파일명' },
    { accessorKey: 'domainType', header: '도메인' },
    { accessorKey: 'provider', header: 'Provider' },
    { accessorKey: 'modelName', header: '모델' },
    {
      accessorKey: 'temperature',
      header: 'Temperature',
      cell: ({ row }) => row.original.temperature ?? '-',
    },
    {
      accessorKey: 'topP',
      header: 'Top P',
      cell: ({ row }) => row.original.topP ?? '-',
    },
    {
      accessorKey: 'maxTokens',
      header: 'Max Tokens',
      cell: ({ row }) => row.original.maxTokens ?? '-',
    },
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
