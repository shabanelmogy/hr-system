import { apiRoutes } from "@/config";
import { apiService } from "@/shared/services";
import type { EmailRecoveryFormData, ResetPasswordFormData } from "../validation/recoverySchemas";

export type RegistrationRequest = {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  profilePicture: string | null;
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
};

export const authService = {
  confirmEmail: (request: { userId: string; code: string }) =>
    apiService.post(apiRoutes.auth.confirmEmail, request),
  acceptInvitation: (request: { invitationId: string; token: string; password: string }) =>
    apiService.post(apiRoutes.userInvitations.accept, request),
  forgetPassword: (request: EmailRecoveryFormData, headers?: Record<string, string>) =>
    apiService.post(apiRoutes.auth.forgetPassword, request, headers),
  resetPassword: (request: ResetPasswordFormData) => apiService.post(apiRoutes.auth.resetPassword, request),
  resendEmailConfirmation: (request: EmailRecoveryFormData, headers?: Record<string, string>) =>
    apiService.post(apiRoutes.auth.resendEmailConfirmation, request, headers),
  register: (request: RegistrationRequest) => apiService.post(apiRoutes.auth.register, request),
  changePassword: (request: ChangePasswordRequest) => apiService.put(apiRoutes.auth.changePassword, request),
  logout: () => apiService.logout(),
};
