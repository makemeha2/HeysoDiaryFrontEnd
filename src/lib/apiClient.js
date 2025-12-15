import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || '';

export function getAuthData() {
  try {
    const raw = localStorage.getItem('auth');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAuthData(auth) {
  try {
    localStorage.setItem('auth', JSON.stringify(auth));
  } catch (err) {
    console.error('Failed to persist auth data', err);
  }
}

export function clearAuthData() {
  localStorage.removeItem('auth');
}

export async function authFetch(url, options = {}) {
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
    ...(auth?.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : auth?.jwtAccessToken
        ? { Authorization: `Bearer ${auth.jwtAccessToken}` }
        : {}),
  };

  const fullUrl = /^(http|https):\/\//i.test(url)
    ? url
    : `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

  const response = await axios({
    url: fullUrl,
    method,
    headers: mergedHeaders,
    params,
    data: body ?? data,
    signal,
    validateStatus: () => true, // allow manual ok check
  });

  const parsedData = Array.isArray(response.data) ? response.data : response.data;

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
