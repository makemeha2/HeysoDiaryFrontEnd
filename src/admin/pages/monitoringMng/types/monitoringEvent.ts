import { format, subMonths } from 'date-fns';

export type ResolutionYn = 'Y' | 'N';
export type MonitoringEventSearchResolvedYn = '' | ResolutionYn;
export type MonitoringEventType = '' | 'ERROR' | 'WARN' | 'INFO' | 'SECURITY' | 'BUSINESS';
export type MonitoringSeverity = '' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MonitoringEventSearchForm = {
  startDate: string;
  endDate: string;
  resolvedYn: MonitoringEventSearchResolvedYn;
  eventType: MonitoringEventType;
  severity: MonitoringSeverity;
  keyword: string;
};

export type MonitoringEventSearchParams = MonitoringEventSearchForm & {
  page: number;
  size: number;
};

export type MonitoringEventListItem = {
  eventId: number;
  createdAt: string;
  eventType: Exclude<MonitoringEventType, ''>;
  severity: Exclude<MonitoringSeverity, ''>;
  eventCode: string;
  title: string;
  requestUri: string | null;
  clientIp: string | null;
  userId: number | null;
  email: string | null;
  traceId: string | null;
  sourceClass: string | null;
  resolvedYn: ResolutionYn;
  resolvedAt: string | null;
  resolvedBy: number | null;
};

export type MonitoringEventDetail = MonitoringEventListItem & {
  message: string | null;
  detailJson: string | null;
  httpMethod: string | null;
  queryString: string | null;
  userAgent: string | null;
  exceptionClass: string | null;
  exceptionMessage: string | null;
  stackTrace: string | null;
  sourceMethod: string | null;
  updatedAt: string | null;
};

export type MonitoringEventPageResponse = {
  items: MonitoringEventListItem[];
  page: number;
  size: number;
  totalCount: number;
  totalPages: number;
};

export type MonitoringEventResolutionRequest = {
  eventIds: number[];
  resolvedYn: ResolutionYn;
};

export type MonitoringEventResolutionResponse = {
  requestedCount: number;
  successCount: number;
  skippedCount: number;
  failedCount: number;
};

export type MonitoringEventDiagnoseResponse = {
  diagnosis: string;
};

const toInputDate = (value: Date) => format(value, 'yyyy-MM-dd');

export const createDefaultMonitoringEventSearchForm = (): MonitoringEventSearchForm => {
  const today = new Date();

  return {
    startDate: toInputDate(subMonths(today, 1)),
    endDate: toInputDate(today),
    resolvedYn: 'N',
    eventType: '',
    severity: '',
    keyword: '',
  };
};

export const MONITORING_EVENT_PAGE_SIZE = 50;
