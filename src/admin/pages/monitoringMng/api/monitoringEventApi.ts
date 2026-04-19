import { adminFetch } from '@admin/lib/api';
import type {
  MonitoringEventDiagnoseResponse,
  MonitoringEventDetail,
  MonitoringEventPageResponse,
  MonitoringEventResolutionRequest,
  MonitoringEventResolutionResponse,
  MonitoringEventSearchParams,
} from '../types/monitoringEvent';

export async function getMonitoringEventPage(params: MonitoringEventSearchParams) {
  const queryParams: Record<string, string | number> = {
    page: params.page,
    size: params.size,
  };

  if (params.startDate) queryParams.startDate = params.startDate;
  if (params.endDate) queryParams.endDate = params.endDate;
  if (params.resolvedYn) queryParams.resolvedYn = params.resolvedYn;
  if (params.eventType) queryParams.eventType = params.eventType;
  if (params.severity) queryParams.severity = params.severity;
  if (params.keyword) queryParams.keyword = params.keyword;

  return adminFetch<MonitoringEventPageResponse>('/api/admin/monitoring-events', {
    params: queryParams,
  });
}

export async function getMonitoringEventDetail(eventId: number) {
  return adminFetch<MonitoringEventDetail>(`/api/admin/monitoring-events/${eventId}`);
}

export async function diagnoseMonitoringEvent(eventId: number) {
  return adminFetch<MonitoringEventDiagnoseResponse>(`/api/admin/monitoring-events/${eventId}/diagnose`, {
    method: 'POST',
  });
}

export async function patchMonitoringEventResolution(request: MonitoringEventResolutionRequest) {
  return adminFetch<MonitoringEventResolutionResponse>('/api/admin/monitoring-events/resolution', {
    method: 'PATCH',
    data: request,
  });
}
