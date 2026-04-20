import * as Dialog from '@radix-ui/react-dialog';
import type { UseMutationResult } from '@tanstack/react-query';
import { AdminApiError } from '@admin/lib/queryClientHelpers';
import type { MonitoringEventDiagnoseResponse, MonitoringEventDetail } from '../types/monitoringEvent';

type MonitoringEventDetailModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  detail: MonitoringEventDetail | null;
  isLoading: boolean;
  diagnoseMutation: UseMutationResult<MonitoringEventDiagnoseResponse, Error, number, unknown>;
};

const DetailRow = ({ label, value, multiline = false }: { label: string; value: string | null; multiline?: boolean }) => (
  <div className="grid gap-1 border-b border-sand/40 py-2">
    <dt className="text-xs font-semibold uppercase tracking-wide text-clay/60">{label}</dt>
    <dd className="text-sm text-clay">
      {multiline ? (
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-white/80 p-2 text-xs">
          {value ?? '-'}
        </pre>
      ) : (
        value ?? '-'
      )}
    </dd>
  </div>
);

const MonitoringEventDetailModal = ({
  open,
  onOpenChange,
  detail,
  isLoading,
  diagnoseMutation,
}: MonitoringEventDetailModalProps) => {
  const diagnoseErrorMessage =
    diagnoseMutation.error instanceof AdminApiError
      ? diagnoseMutation.error.errorMessage
      : diagnoseMutation.error?.message ?? null;

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) {
      diagnoseMutation.reset();
    }
    onOpenChange(nextOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-[51] flex h-[92vh] w-[96vw] max-w-7xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl border border-sand/60 bg-white p-5 shadow-xl">
          <div className="flex items-start justify-between gap-3 border-b border-sand/50 pb-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-clay">모니터링 이벤트 상세</Dialog.Title>
              <Dialog.Description className="mt-1 text-xs text-clay/70">
                {detail
                  ? `event_id ${detail.eventId} · created_at ${detail.createdAt}`
                  : '선택한 이벤트의 상세 정보를 확인합니다.'}
              </Dialog.Description>
            </div>
            <div className="flex items-center gap-2">
              {detail && (
                <span
                  className={`rounded-full px-2 py-1 text-xs ${
                    detail.resolvedYn === 'Y' ? 'bg-amber/20 text-clay' : 'bg-sand/40 text-clay/70'
                  }`}
                >
                  조치 {detail.resolvedYn}
                </span>
              )}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-md border border-sand px-3 py-1.5 text-xs text-clay sm:text-sm"
                >
                  닫기
                </button>
              </Dialog.Close>
            </div>
          </div>

          <div className="mt-4 min-h-0 flex-1 overflow-auto rounded-lg bg-linen/30 p-4">
            {isLoading ? (
              <p className="text-sm text-clay/70">상세 정보를 불러오는 중입니다.</p>
            ) : !detail ? (
              <p className="text-sm text-clay/70">선택한 이벤트의 상세 정보를 불러오지 못했습니다.</p>
            ) : (
              <dl>
                <DetailRow label="message" value={detail.message} multiline />
                <DetailRow label="detail_json" value={detail.detailJson} multiline />
                <DetailRow label="http_method" value={detail.httpMethod} />
                <DetailRow label="query_string" value={detail.queryString} multiline />
                <DetailRow label="user_agent" value={detail.userAgent} multiline />
                <DetailRow label="exception_class" value={detail.exceptionClass} />
                <DetailRow label="exception_message" value={detail.exceptionMessage} multiline />
                <DetailRow label="stack_trace" value={detail.stackTrace} multiline />
                <DetailRow label="source_class" value={detail.sourceClass} />
                <DetailRow label="source_method" value={detail.sourceMethod} />
                <DetailRow label="updated_at" value={detail.updatedAt} />
              </dl>
            )}

            <div className="mt-4 border-t border-sand/50 pt-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-clay">AI 진단</h3>
                  <p className="mt-1 text-xs text-clay/70">현재 이벤트 로그를 기준으로 원인과 대응 방안을 진단합니다.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (!detail || diagnoseMutation.isPending) return;
                    diagnoseMutation.mutate(detail.eventId);
                  }}
                  disabled={!detail || diagnoseMutation.isPending}
                  className="rounded-md bg-clay px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:bg-clay/40 sm:text-sm"
                >
                  {diagnoseMutation.isPending ? '진단 중...' : '진단'}
                </button>
              </div>

              <div className="mt-3 rounded-lg border border-sand/50 bg-white/70 p-3">
                {diagnoseMutation.isPending ? (
                  <p className="text-sm text-clay/70">AI가 진단 중입니다...</p>
                ) : diagnoseMutation.data?.diagnosis ? (
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-md bg-white/80 p-2 text-xs text-clay">
                    {diagnoseMutation.data.diagnosis}
                  </pre>
                ) : diagnoseErrorMessage ? (
                  <p className="rounded border border-blush/50 bg-blush/20 px-3 py-2 text-sm text-clay">
                    {diagnoseErrorMessage}
                  </p>
                ) : (
                  <p className="text-sm text-clay/60">진단 버튼을 눌러 AI 분석 결과를 확인하세요.</p>
                )}
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default MonitoringEventDetailModal;
