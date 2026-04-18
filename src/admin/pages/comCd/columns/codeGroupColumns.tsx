import type { ColumnDef } from '@tanstack/react-table';
import type { CommonCodeGroup } from '@admin/types/comCd';

type BuildCodeGroupColumnsOptions = {
  showEditedAt: boolean;
  onEdit?: (row: CommonCodeGroup) => void;
};

export function buildCodeGroupColumns({
  showEditedAt,
  onEdit,
}: BuildCodeGroupColumnsOptions): ColumnDef<CommonCodeGroup>[] {
  const columns: ColumnDef<CommonCodeGroup>[] = [
    {
      accessorKey: 'groupId',
      header: '그룹 ID',
      cell: ({ row }) => <span className="font-semibold">{row.original.groupId}</span>,
    },
    {
      accessorKey: 'groupName',
      header: '그룹명',
      cell: ({ row }) => row.original.groupName,
    },
    {
      accessorKey: 'isActive',
      header: '상태',
      cell: ({ row }) => (row.original.isActive ? '활성' : '비활성'),
    },
  ];

  if (showEditedAt) {
    columns.push(
      {
        accessorKey: 'createdAt',
        header: '최초등록일시',
        cell: ({ row }) => row.original.createdAt ?? '-',
      },
      {
        accessorKey: 'updatedAt',
        header: '최종수정일시',
        cell: ({ row }) => row.original.updatedAt ?? '-',
      },
    );
  }

  columns.push({
    id: 'actions',
    header: 'Edit',
    cell: ({ row }) => (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onEdit?.(row.original);
        }}
        className="rounded border border-sand px-2 py-1 text-xs text-clay hover:bg-sand/20"
      >
        수정
      </button>
    ),
  });

  return columns;
}
