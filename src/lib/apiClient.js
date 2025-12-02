export function getAuthData() {
  try {
    const raw = localStorage.getItem('auth')
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setAuthData(auth) {
  try {
    localStorage.setItem('auth', JSON.stringify(auth))
  } catch (err) {
    console.error('Failed to persist auth data', err)
  }
}

export function clearAuthData() {
  localStorage.removeItem('auth')
}

export async function authFetch(url, options = {}) {
  const auth = getAuthData()
  const headers = {
    ...(options.headers || {}),
    ...(auth?.accessToken
      ? { Authorization: `Bearer ${auth.accessToken}` }
      : auth?.jwtAccessToken
        ? { Authorization: `Bearer ${auth.jwtAccessToken}` }
        : {}),
  }

  return fetch(url, { ...options, headers })
}
