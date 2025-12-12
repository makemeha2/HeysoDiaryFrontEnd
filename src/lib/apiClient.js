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
  if (auth?.accessToken) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${auth.accessToken}` };
  } else if (auth?.jwtAccessToken) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${auth.jwtAccessToken}` };
  }
  return config;
});

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
