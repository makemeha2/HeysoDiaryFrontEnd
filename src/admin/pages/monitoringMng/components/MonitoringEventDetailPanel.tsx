import type { MonitoringEventDetail } from '../types/monitoringEvent';

type MonitoringEventDetailPanelProps = {
  detail: MonitoringEventDetail | null;
  isLoading: boolean;
};

const DetailRow = ({ label, value, multiline = false }: { label: string; value: string | null; multiline?: boolean }) => (
  <div className="grid gap-1 border-b border-sand/40 py-2">
    <dt className="text-xs font-semibold uppercase tracking-wide text-clay/60">{label}</dt>
    <dd className="text-sm text-clay">
      {multiline ? (
        <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words rounded-md bg-linen/70 p-2 text-xs">
          {value ?? '-'}
        </pre>
      ) : (
        value ?? '-'
      )}
    </dd>
  </div>
);

const MonitoringEventDetailPanel = ({ detail, isLoading }: MonitoringEventDetailPanelProps) => {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-sand/60 bg-linen/40 p-4">
        <h2 className="font-semibold text-clay">상세 보기</h2>
        <p className="mt-3 text-sm text-clay/70">상세 정보를 불러오는 중입니다.</p>
      </section>
    );
  }

  if (!detail) {
    return (
      <section className="rounded-xl border border-sand/60 bg-linen/40 p-4">
        <h2 className="font-semibold text-clay">상세 보기</h2>
        <p className="mt-3 text-sm text-clay/70">목록에서 이벤트를 선택하면 상세 정보가 표시됩니다.</p>
      </section>
    );
  }

  return (
    <section className="rounded-xl border border-sand/60 bg-linen/40 p-4">
      <div className="flex items-start justify-between gap-2 border-b border-sand/50 pb-3">
        <div>
          <h2 className="font-semibold text-clay">상세 보기</h2>
          <p className="mt-1 text-xs text-clay/70">
            event_id {detail.eventId} · created_at {detail.createdAt}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-xs ${
            detail.resolvedYn === 'Y' ? 'bg-amber/20 text-clay' : 'bg-sand/40 text-clay/70'
          }`}
        >
          조치 {detail.resolvedYn}
        </span>
      </div>

      <dl className="mt-3">
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
    </section>
  );
};

export default MonitoringEventDetailPanel;
