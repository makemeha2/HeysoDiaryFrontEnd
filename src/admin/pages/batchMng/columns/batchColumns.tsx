import type { ColumnDef } from '@tanstack/react-table';
import type { AdminBatch, BatchExecution, BatchExecutionStatus, BatchTriggerType } from '../types/batchMng';

const statusLabelMap: Record<BatchExecutionStatus, string> = {
  RUNNING: '실행 중',
  SUCCESS: '성공',
  FAILED: '실패',
};

const triggerLabelMap: Record<BatchTriggerType, string> = {
  AUTO: '자동',
  MANUAL: '수동',
};

const statusClassMap: Record<BatchExecutionStatus, string> = {
  RUNNING: 'border-amber/60 bg-amber/20 text-clay',
  SUCCESS: 'border-green-200 bg-green-50 text-green-700',
  FAILED: 'border-blush/50 bg-blush/20 text-clay',
};

export const formatDateTime = (value: string | null) => {
  if (!value) return '-';
  return value.replace('T', ' ').slice(0, 19);
};

const formatDuration = (value: number | null) => {
  if (value == null) return '-';
  if (value < 1000) return `${value}ms`;
  return `${(value / 1000).toFixed(1)}s`;
};

const renderStatusBadge = (status: BatchExecutionStatus | null | undefined) => {
  if (!status) return <span className="text-clay/60">-</span>;
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${statusClassMap[status]}`}>
      {statusLabelMap[status]}
    </span>
  );
};

type BatchColumnOptions = {
  onExecute: (batch: AdminBatch) => void;
  isExecuting: boolean;
};

export const buildBatchColumns = ({ onExecute, isExecuting }: BatchColumnOptions): ColumnDef<AdminBatch>[] => [
  {
    header: '배치명',
    accessorKey: 'name',
    cell: ({ row }) => (
      <div className="min-w-[220px]">
        <p className="font-semibold text-clay">{row.original.name}</p>
        <p className="mt-1 text-xs text-clay/70">{row.original.description}</p>
      </div>
    ),
  },
  {
    header: 'Key',
    accessorKey: 'batchKey',
    cell: ({ getValue }) => <code className="text-xs text-clay">{String(getValue())}</code>,
  },
  {
    header: 'Cron',
    accessorKey: 'cronExpression',
    cell: ({ row }) => (
      <div className="min-w-[150px] text-xs">
        <code>{row.original.cronExpression}</code>
        <p className="mt-1 text-clay/60">{row.original.zone}</p>
      </div>
    ),
  },
  {
    header: '최근 상태',
    cell: ({ row }) => renderStatusBadge(row.original.latestExecution?.status),
  },
  {
    header: '최근 시작',
    cell: ({ row }) => formatDateTime(row.original.latestExecution?.startedAt ?? null),
  },
  {
    header: '최근 종료',
    cell: ({ row }) => formatDateTime(row.original.latestExecution?.finishedAt ?? null),
  },
  {
    header: '소요',
    cell: ({ row }) => formatDuration(row.original.latestExecution?.durationMs ?? null),
  },
  {
    header: '실행',
    cell: ({ row }) => (
      <button
        type="button"
        disabled={row.original.running || isExecuting}
        onClick={(event) => {
          event.stopPropagation();
          onExecute(row.original);
        }}
        className="rounded bg-clay px-3 py-1 text-xs text-white disabled:cursor-not-allowed disabled:bg-clay/35"
      >
        {row.original.running ? '실행 중' : '수동 실행'}
      </button>
    ),
  },
];

export const buildBatchExecutionColumns = (): ColumnDef<BatchExecution>[] => [
  {
    header: 'ID',
    accessorKey: 'executionId',
  },
  {
    header: '상태',
    cell: ({ row }) => renderStatusBadge(row.original.status),
  },
  {
    header: '유형',
    cell: ({ row }) => triggerLabelMap[row.original.triggerType],
  },
  {
    header: '요청자',
    cell: ({ row }) => row.original.requestedByEmail ?? '-',
  },
  {
    header: '시작',
    cell: ({ row }) => formatDateTime(row.original.startedAt),
  },
  {
    header: '종료',
    cell: ({ row }) => formatDateTime(row.original.finishedAt),
  },
  {
    header: '소요',
    cell: ({ row }) => formatDuration(row.original.durationMs),
  },
  {
    header: '성공/실패',
    cell: ({ row }) => `${row.original.successCount} / ${row.original.failureCount}`,
  },
  {
    header: '메시지',
    cell: ({ row }) => (
      <div className="max-w-[360px]">
        <p className="whitespace-pre-wrap text-clay">{row.original.message ?? '-'}</p>
        {row.original.errorMessage && (
          <p className="mt-1 whitespace-pre-wrap text-xs text-blush">{row.original.errorMessage}</p>
        )}
      </div>
    ),
  },
];
