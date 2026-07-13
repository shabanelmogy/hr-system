import { version } from "./constants";

export interface AuthRoutes {
  login: string;
  refreshToken: string;
  register: string;
  changePassword: string;
  forgetPassword: string;
  resetPassword: string;
  resendEmailConfirmation: string;
  getUserPhoto: string;
  updateUserPhoto: string;
  getUserInfo: string;
  updateUserInfo: string;
  confirmEmail: string;
}

export const auth: AuthRoutes = {
  login: `${version}/auth/login`,
  refreshToken: `${version}/auth/refreshToken`,
  register: `${version}/auth/register`,
  changePassword: "/api/account-info/ChangePassword",
  forgetPassword: `${version}/auth/forgetPassword`,
  resetPassword: `${version}/auth/resetPassword`,
  resendEmailConfirmation: `${version}/auth/resendConfirmationEmail`,
  getUserPhoto: "/api/account-info/GetUserPhoto",
  updateUserPhoto: "/api/account-info/UpdateUserPicture",
  getUserInfo: "/api/account-info/GetInfo",
  updateUserInfo: "/api/account-info/UpdateInfo",
  confirmEmail: `${version}/auth/confirmEmail`,
};
