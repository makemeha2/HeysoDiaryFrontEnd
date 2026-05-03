import axios, {
  type AxiosRequestConfig,
  type AxiosResponse,
  type RawAxiosRequestHeaders,
} from 'axios';

export type AuthData = {
  accessToken?: string | null;
  jwtAccessToken?: string | null;
  [key: string]: unknown;
};

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

const baseUrl =
  import.meta.env.VITE_APP_ENV === 'PROD' ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

export function getAuthData(): AuthData | null {
  try {
    const raw = localStorage.getItem('auth');
    return raw ? (JSON.parse(raw) as AuthData) : null;
  } catch {
    return null;
  }
}

export function setAuthData(auth: AuthData | null): void {
  try {
    localStorage.setItem('auth', JSON.stringify(auth));
  } catch (err) {
    console.error('Failed to persist auth data', err);
  }
}

export function clearAuthData(): void {
  localStorage.removeItem('auth');
}

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
  const mergedHeaders = {
    ...headers,
    ...(auth?.accessToken   // TODO : 확인한 하나만 쓰자. 불필요한 분기 및 방어처리임
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : auth?.jwtAccessToken
        ? { Authorization: `Bearer ${auth.jwtAccessToken}` }
        : {}),
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
    ...rest,
    validateStatus: () => true, // allow manual ok check
  });

  const parsedData = response.data;

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
