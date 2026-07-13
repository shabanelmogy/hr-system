const version = "/api/v1";

export interface AuthRoutes {
  home: string;
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
  home: "/",
  login: `${version}/auth/login`,
  refreshToken: `${version}/auth/refreshToken`,
  register: `${version}/auth/register`,
  changePassword: "accountInfo/changePassword",
  forgetPassword: `${version}/forgetPassword`,
  resetPassword: `${version}/auth/resetPassword`,
  resendEmailConfirmation: `${version}/auth/resendConfirmationEmail`,
  getUserPhoto: "accountInfo/getUserPhoto",
  updateUserPhoto: "accountInfo/updateUserPicture",
  getUserInfo: "accountInfo/getInfo",
  updateUserInfo: "accountInfo/updateInfo",
  confirmEmail: `${version}/auth/confirmEmail`,
};
