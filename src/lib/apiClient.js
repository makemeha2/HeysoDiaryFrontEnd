import axios from 'axios';

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
  const method = options.method || 'GET';
  const body = options.body;
  const auth = getAuthData();
  const headers = {
    ...(options.headers || {}),
    ...(auth?.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : auth?.jwtAccessToken
        ? { Authorization: `Bearer ${auth.jwtAccessToken}` }
        : {}),
  };

  const baseUrl = import.meta.env.VITE_API_BASE_URL;

  const fullUrl = /^(http|https):\/\//i.test(url)
    ? url
    : `${baseUrl.replace(/\/$/, '')}/${url.replace(/^\//, '')}`;

  const response = await axios({
    url: fullUrl,
    method,
    headers,
    data: body,
    signal: options.signal,
    validateStatus: () => true, // allow manual ok check
  });

  return {
    ok: response.status >= 200 && response.status < 300,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    url: response.config?.url || fullUrl,
    json: async () => response.data,
    text: async () =>
      typeof response.data === 'string' ? response.data : JSON.stringify(response.data),
    raw: response,
  };
}
