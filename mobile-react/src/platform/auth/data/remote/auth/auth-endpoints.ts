import { ENV } from '@/src/core/config/env';

const apiRootUrl = ENV.apiUrl.replace(/\/api\/v\d+$/i, '');

export const AUTH_ENDPOINTS = {
  login: 'auth/login',
  register: 'auth/register',
  forgetPassword: 'auth/forgetPassword',
  resetPassword: 'auth/resetPassword',
  confirmEmail: 'auth/confirmEmail',
  acceptInvitation: 'account-invitations/accept',
  resendConfirmationEmail: 'auth/resendConfirmationEmail',
  selectTenant: 'auth/selectTenant',
  selectCompany: 'auth/selectCompany',
  switchCompany: 'auth/switchCompany',
  refreshToken: 'auth/refreshToken',
  logout: 'auth/logOut',
  session: 'auth/session',
  userPhoto: `${apiRootUrl}/AccountInfo/GetUserPhoto`,
} as const;
