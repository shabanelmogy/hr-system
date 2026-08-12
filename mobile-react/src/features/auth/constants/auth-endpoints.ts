import { ENV } from '@/src/core/config/env';

const apiRootUrl = ENV.apiUrl.replace(/\/api\/v\d+$/i, '');

export const AUTH_ENDPOINTS = {
  login: 'auth/login',
  register: 'auth/register',
  selectCompany: 'auth/selectCompany',
  refreshToken: 'auth/refreshToken',
  logout: 'auth/logOut',
  session: 'auth/session',
  userPhoto: `${apiRootUrl}/AccountInfo/GetUserPhoto`,
} as const;
