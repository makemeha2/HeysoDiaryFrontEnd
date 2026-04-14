import {
  flexRender,
  getCoreRowModel,
  type ColumnDef,
  useReactTable,
} from '@tanstack/react-table';

type AdminDataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData>[];
  rowKey: (row: TData) => string;
  onRowClick?: (row: TData) => void;
  selectedKey?: string | null;
  emptyMessage?: string;
  maxHeightClassName?: string;
  tableClassName?: string;
};

const AdminDataTable = <TData,>({
  data,
  columns,
  rowKey,
  onRowClick,
  selectedKey,
  emptyMessage = '데이터가 없습니다.',
  maxHeightClassName,
  tableClassName,
}: AdminDataTableProps<TData>) => {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div
      className={`w-full overflow-auto rounded-md border border-sand/60 bg-white ${maxHeightClassName ?? ''}`.trim()}
    >
      <table
        className={`w-full min-w-[400px] border-collapse text-xs sm:text-sm ${tableClassName ?? ''}`.trim()}
      >
        <thead className="bg-linen">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="border-b border-sand/70">
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 text-left font-semibold text-clay">
                  {header.isPlaceholder
                    ? null
                    : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody>
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="px-3 py-6 text-center text-clay/70">
                {emptyMessage}
              </td>
            </tr>
          )}

          {table.getRowModel().rows.map((row) => {
            const key = rowKey(row.original);
            const isSelected = selectedKey != null && selectedKey === key;
            return (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row.original)}
                className={`border-b border-sand/40 ${
                  onRowClick ? 'cursor-pointer hover:bg-amber/10' : ''
                } ${isSelected ? 'bg-amber/20' : 'bg-white'}`}
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-top text-clay">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default AdminDataTable;
