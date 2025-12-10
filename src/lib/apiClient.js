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

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

const api = axios.create({
  baseURL: baseUrl || undefined,
});

api.interceptors.request.use((config) => {
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

  return api.request({
    url,
    method,
    headers,
    params,
    data: data !== undefined ? data : body,
    signal,
    validateStatus: () => true,
    ...rest,
  });
}
