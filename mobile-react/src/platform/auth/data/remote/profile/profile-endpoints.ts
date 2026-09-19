import { ENV } from '@/src/core/config/env';

const accountInfoUrl = ENV.apiUrl.replace(/\/api\/v\d+$/i, '') + '/AccountInfo';

export const profileEndpoints = {
  info: `${accountInfoUrl}/GetInfo`,
  photo: `${accountInfoUrl}/GetUserPhoto`,
  updateInfo: `${accountInfoUrl}/UpdateInfo`,
  updatePhoto: `${accountInfoUrl}/UpdateUserPicture`,
  changePassword: `${accountInfoUrl}/ChangePassword`,
} as const;
