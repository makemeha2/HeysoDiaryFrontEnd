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

  return fetch(fullUrl, { ...options, headers });
}
