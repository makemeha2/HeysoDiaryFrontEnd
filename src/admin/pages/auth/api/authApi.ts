import { adminFetch } from '@admin/lib/api';

type AdminLoginResponse = {
  accessToken: string;
  userId: number;
  email: string;
  nickname: string;
  role: string;
};

export function loginAdmin(loginId: string, password: string) {
  return adminFetch<AdminLoginResponse>('/api/admin/auth/login', {
    method: 'POST',
    data: { loginId, password },
  });
}
