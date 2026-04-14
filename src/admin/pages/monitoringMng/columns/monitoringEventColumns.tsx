import type { ColumnDef } from '@tanstack/react-table';
import type { MonitoringEventListItem } from '../types/monitoringEvent';

type BuildMonitoringEventColumnsOptions = {
  selectedIds: Set<number>;
  currentPageIds: number[];
  onToggleAll: (checked: boolean) => void;
  onToggleOne: (eventId: number, checked: boolean) => void;
};

const renderText = (value: string | number | null | undefined) => value ?? '-';

const createHeaderCheckboxState = (selectedIds: Set<number>, currentPageIds: number[]) => {
  if (currentPageIds.length === 0) {
    return { checked: false, indeterminate: false };
  }

  const selectedCount = currentPageIds.filter((eventId) => selectedIds.has(eventId)).length;
  return {
    checked: selectedCount === currentPageIds.length,
    indeterminate: selectedCount > 0 && selectedCount < currentPageIds.length,
  };
};

export function buildMonitoringEventColumns({
  selectedIds,
  currentPageIds,
  onToggleAll,
  onToggleOne,
}: BuildMonitoringEventColumnsOptions): ColumnDef<MonitoringEventListItem>[] {
  const headerState = createHeaderCheckboxState(selectedIds, currentPageIds);

  return [
    {
      id: 'select',
      header: () => (
        <input
          type="checkbox"
          checked={headerState.checked}
          ref={(node) => {
            if (node) {
              node.indeterminate = headerState.indeterminate;
            }
          }}
          onChange={(event) => onToggleAll(event.target.checked)}
          aria-label="현재 페이지 전체 선택"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={selectedIds.has(row.original.eventId)}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => onToggleOne(row.original.eventId, event.target.checked)}
          aria-label={`이벤트 ${row.original.eventId} 선택`}
        />
      ),
    },
    { accessorKey: 'eventId', header: 'event_id' },
    {
      accessorKey: 'createdAt',
      header: 'created_at',
      cell: ({ row }) => <span className="whitespace-nowrap">{renderText(row.original.createdAt)}</span>,
    },
    { accessorKey: 'eventType', header: 'event_type' },
    { accessorKey: 'severity', header: 'severity' },
    { accessorKey: 'eventCode', header: 'event_code' },
    {
      accessorKey: 'title',
      header: 'title',
      cell: ({ row }) => <span className="line-clamp-2 min-w-[180px]">{renderText(row.original.title)}</span>,
    },
    {
      accessorKey: 'requestUri',
      header: 'request_uri',
      cell: ({ row }) => <span className="min-w-[180px]">{renderText(row.original.requestUri)}</span>,
    },
    { accessorKey: 'clientIp', header: 'client_ip', cell: ({ row }) => renderText(row.original.clientIp) },
    { accessorKey: 'userId', header: 'user_id', cell: ({ row }) => renderText(row.original.userId) },
    { accessorKey: 'traceId', header: 'trace_id', cell: ({ row }) => renderText(row.original.traceId) },
    { accessorKey: 'sourceClass', header: 'source_class', cell: ({ row }) => renderText(row.original.sourceClass) },
    {
      accessorKey: 'resolvedYn',
      header: 'resolved_yn',
      cell: ({ row }) => (
        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            row.original.resolvedYn === 'Y' ? 'bg-amber/20 text-clay' : 'bg-sand/40 text-clay/70'
          }`}
        >
          {row.original.resolvedYn}
        </span>
      ),
    },
    {
      accessorKey: 'resolvedAt',
      header: 'resolved_at',
      cell: ({ row }) => <span className="whitespace-nowrap">{renderText(row.original.resolvedAt)}</span>,
    },
    { accessorKey: 'resolvedBy', header: 'resolved_by', cell: ({ row }) => renderText(row.original.resolvedBy) },
  ];
}
