import axios from 'axios';
import { clearAdminAccessToken, getAdminAccessToken } from './auth';

const baseUrl =
  import.meta.env.VITE_APP_ENV === 'PROD' ? '' : (import.meta.env.VITE_API_BASE_URL ?? '');

function resolveUrl(url: string): string {
  if (/^(http|https):\/\//i.test(url)) return url;
  return `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;
}

export type AdminApiResult<T = unknown> = {
  ok: boolean;
  status: number;
  data: T;
  errorMessage?: string;
};

export async function adminFetch<T = unknown>(
  url: string,
  options: {
    method?: 'GET' | 'POST';
    data?: unknown;
    params?: Record<string, string | number | boolean>;
  } = {},
): Promise<AdminApiResult<T>> {
  const token = getAdminAccessToken();

  const response = await axios({
    url: resolveUrl(url),
    method: options.method ?? 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    data: options.data,
    params: options.params,
    validateStatus: () => true,
  });

  if (response.status === 401) {
    clearAdminAccessToken();
  }

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    data: response.data as T,
    errorMessage: typeof response.data?.message === 'string' ? response.data.message : undefined,
  };
}
