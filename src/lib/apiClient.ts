import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type RawAxiosRequestHeaders,
} from 'axios';

export type AuthData = {
  accessToken?: string | null;
  [key: string]: unknown;
};

export type AuthErrorReason = 'expired' | 'invalid' | 'revoked' | 'inactive' | 'unknown';

// 401 발생 시 호출될 핸들러를 외부에서 등록한다.
// - 인증 미부착 요청(public 엔드포인트)에는 호출하지 않는다.
// - validate 엔드포인트는 그 자체가 토큰 체크용이므로 핸들러를 건너뛴다.
type SessionExpiredHandler = (info: { url: string; status: number; authError: AuthErrorReason }) => void;
let sessionExpiredHandler: SessionExpiredHandler | null = null;

export function registerSessionExpiredHandler(handler: SessionExpiredHandler | null): void {
  sessionExpiredHandler = handler;
}

export type AuthFetchOptions<TBody = unknown> = Omit<
  AxiosRequestConfig,
  'data' | 'headers' | 'method' | 'params' | 'signal' | 'url' | 'validateStatus'
> & {
  method?: AxiosRequestConfig['method'];
  headers?: RawAxiosRequestHeaders;
  body?: TBody;
  data?: TBody;
  params?: AxiosRequestConfig['params'];
  signal?: AbortSignal;
};

export type AuthFetchResponse<TData = unknown> = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: AxiosResponse<TData>['headers'];
  url: string;
  data: TData;
  json: () => Promise<TData>;
  text: () => Promise<string>;
  raw: AxiosResponse<TData>;
};

const resolveBaseUrl = (): string => {
  if (import.meta.env.VITE_APP_ENV === 'PROD') return '';

  const configured = import.meta.env.VITE_API_BASE_URL ?? '';
  if (!configured || typeof window === 'undefined') return configured;

  try {
    const apiUrl = new URL(configured);
    const pageHost = window.location.hostname;
    const loopbackHosts = new Set(['localhost', '127.0.0.1']);
    if (loopbackHosts.has(apiUrl.hostname) && loopbackHosts.has(pageHost)) {
      apiUrl.hostname = pageHost;
      return apiUrl.toString().replace(/\/$/, '');
    }
  } catch {
    return configured;
  }

  return configured;
};

const baseUrl = resolveBaseUrl();

const CSRF_COOKIE_NAME = 'heyso_csrf_token';
const CSRF_HEADER_NAME = 'X-CSRF-Token';
const UNSAFE_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export function getAuthData(): AuthData | null {
  try {
    const raw = localStorage.getItem('auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthData;
    if (parsed.accessToken) {
      const { accessToken: _accessToken, ...safeAuth } = parsed;
      localStorage.setItem('auth', JSON.stringify(safeAuth));
      return safeAuth;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function setAuthData(auth: AuthData | null): void {
  try {
    if (!auth) {
      localStorage.removeItem('auth');
      return;
    }
    const { accessToken: _accessToken, ...safeAuth } = auth ?? {};
    localStorage.setItem('auth', JSON.stringify(safeAuth));
  } catch (err) {
    console.error('Failed to persist auth data', err);
  }
}

export function clearAuthData(): void {
  localStorage.removeItem('auth');
}

const normalizeAuthError = (value: unknown): AuthErrorReason => {
  if (typeof value !== 'string') return 'unknown';
  if (value === 'expired' || value === 'invalid' || value === 'revoked' || value === 'inactive') {
    return value;
  }
  return 'unknown';
};

const readCookie = (name: string): string | null => {
  const cookies = document.cookie ? document.cookie.split('; ') : [];
  for (const cookie of cookies) {
    const [key, ...valueParts] = cookie.split('=');
    if (key === name) {
      return decodeURIComponent(valueParts.join('='));
    }
  }
  return null;
};

const shouldAttachCsrf = (method: AxiosRequestConfig['method']): boolean => {
  return UNSAFE_METHODS.has(String(method ?? 'GET').toUpperCase());
};

export async function authFetch<TData = unknown, TBody = unknown>(
  url: string,
  options: AuthFetchOptions<TBody> = {},
): Promise<AuthFetchResponse<TData>> {
  const {
    method = 'GET',
    headers = {},
    body,
    data,
    params,
    signal,
    ...rest
  } = options;

  const auth = getAuthData();
  const csrfToken = readCookie(CSRF_COOKIE_NAME);
  const mergedHeaders = {
    ...headers,
    ...(csrfToken && shouldAttachCsrf(method) ? { [CSRF_HEADER_NAME]: csrfToken } : {}),
  };

  const fullUrl = /^(http|https):\/\//i.test(url)
    ? url
    : `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

  const response = await axios<TData>({
    url: fullUrl,
    method,
    headers: mergedHeaders,
    params,
    data: body ?? data,
    signal,
    withCredentials: true,
    ...rest,
    validateStatus: () => true, // allow manual ok check
  });

  const parsedData = response.data;

  // 토큰을 부착해 보낸 요청이 401을 받으면 세션이 만료된 것으로 간주한다.
  // /api/auth/validate 는 토큰 자체의 유효성을 검사하는 엔드포인트라 별도 처리.
  if (
    response.status === 401 &&
    (Boolean(auth) || Boolean(csrfToken)) &&
    !fullUrl.includes('/api/auth/validate') &&
    sessionExpiredHandler
  ) {
    try {
      sessionExpiredHandler({
        url: fullUrl,
        status: response.status,
        authError: normalizeAuthError(response.headers['x-auth-error']),
      });
    } catch (err) {
      console.error('sessionExpiredHandler threw', err);
    }
  }

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    url: response.config?.url || fullUrl,
    data: parsedData,
    json: async () => parsedData,
    text: async () =>
      typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
    raw: response,
  };
}
