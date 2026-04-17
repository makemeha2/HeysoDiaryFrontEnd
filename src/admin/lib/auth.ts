export const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token';
export const ADMIN_USER_ID_KEY = 'admin_user_id';

export function getAdminAccessToken(): string | null {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string): void {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
}

export function setAdminUserId(userId: number): void {
  localStorage.setItem(ADMIN_USER_ID_KEY, String(userId));
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const payload = token.split('.')[1];
  if (!payload) return null;

  try {
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    return JSON.parse(window.atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function getAdminUserId(): number | null {
  const stored = localStorage.getItem(ADMIN_USER_ID_KEY);
  if (stored) {
    const parsed = Number(stored);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  const token = getAdminAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  const candidateKeys = ['userId', 'id', 'sub'];
  for (const key of candidateKeys) {
    const value = payload?.[key];
    const parsed = typeof value === 'number' ? value : Number(value);
    if (Number.isFinite(parsed)) {
      setAdminUserId(parsed);
      return parsed;
    }
  }

  return null;
}

export function clearAdminAccessToken(): void {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  localStorage.removeItem(ADMIN_USER_ID_KEY);
}
