export const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token';

export function getAdminAccessToken(): string | null {
  return localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function setAdminAccessToken(token: string): void {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token);
}

export function clearAdminAccessToken(): void {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
}
