import type { ColumnDef } from '@tanstack/react-table';
import type { CommonCode } from '@admin/types/comCd';

type BuildCodeColumnsOptions = {
  showEditedAt: boolean;
  onEdit?: (row: CommonCode) => void;
};

export function buildCodeColumns({ showEditedAt, onEdit }: BuildCodeColumnsOptions): ColumnDef<CommonCode>[] {
  const columns: ColumnDef<CommonCode>[] = [
    {
      accessorKey: 'codeId',
      header: '코드 ID',
      cell: ({ row }) => <span className="font-semibold">{row.original.codeId}</span>,
    },
    {
      accessorKey: 'codeName',
      header: '코드명',
      cell: ({ row }) => row.original.codeName,
    },
    {
      accessorKey: 'sortSeq',
      header: '정렬',
      cell: ({ row }) => row.original.sortSeq,
    },
    {
      accessorKey: 'isActive',
      header: '상태',
      cell: ({ row }) => (row.original.isActive ? '활성' : '비활성'),
    },
    {
      accessorKey: 'extraInfo1',
      header: '추가정보1',
      cell: ({ row }) => row.original.extraInfo1 ?? '-',
    },
    {
      accessorKey: 'extraInfo2',
      header: '추가정보2',
      cell: ({ row }) => row.original.extraInfo2 ?? '-',
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
