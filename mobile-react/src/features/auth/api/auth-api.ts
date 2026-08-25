import { ApiError, apiService, toApiError } from '@/src/core/api';
import { secureSession } from '@/src/core/storage/secure-storage';
import { AUTH_ENDPOINTS } from '@/src/features/auth/constants/auth-endpoints';
import {
  parseAuthResponse,
  parseLoginOutcome,
  parseSessionResponse,
  parseUserPhoto,
} from '@/src/features/auth/schemas/auth-response-schema';
import type {
  AuthResponse,
  ConfirmEmailRequest,
  AcceptInvitationRequest,
  LoginOutcome,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SessionResponse,
  UserPhoto,
} from '@/src/features/auth/types/auth';

let refreshInFlight: Promise<string | null> | null = null;

export const authApi = {
  async register(request: RegisterRequest): Promise<void> {
    await apiService.post<void, RegisterRequest>(AUTH_ENDPOINTS.register, request, {
      skipAuth: true,
      skipAuthRefresh: true,
    });
  },

  async forgetPassword(email: string): Promise<void> {
    await apiService.post<void, { email: string }>(
      AUTH_ENDPOINTS.forgetPassword,
      { email },
      { skipAuth: true, skipAuthRefresh: true },
    );
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    await apiService.post<void, ResetPasswordRequest>(
      AUTH_ENDPOINTS.resetPassword,
      request,
      { skipAuth: true, skipAuthRefresh: true },
    );
  },

  async confirmEmail(request: ConfirmEmailRequest): Promise<void> {
    await apiService.post<void, ConfirmEmailRequest>(
      AUTH_ENDPOINTS.confirmEmail,
      request,
      { skipAuth: true, skipAuthRefresh: true },
    );
  },

  async acceptInvitation(request: AcceptInvitationRequest): Promise<void> {
    await apiService.post<void, AcceptInvitationRequest>(
      AUTH_ENDPOINTS.acceptInvitation,
      request,
      { skipAuth: true, skipAuthRefresh: true, allowWhenReadOnly: true },
    );
  },

  async resendConfirmationEmail(email: string): Promise<void> {
    await apiService.post<void, { email: string }>(
      AUTH_ENDPOINTS.resendConfirmationEmail,
      { email },
      { skipAuth: true, skipAuthRefresh: true },
    );
  },

  async login(request: LoginRequest): Promise<LoginOutcome> {
    const response = await apiService.post<unknown, LoginRequest>(AUTH_ENDPOINTS.login, request, {
      skipAuth: true,
      skipAuthRefresh: true,
    });
    return parseLoginOutcome(response);
  },

  async selectTenant(tenantSelectionToken: string, tenantId: string): Promise<LoginOutcome> {
    const response = await apiService.post<unknown, {
      tenantSelectionToken: string;
      tenantId: string;
    }>(
      AUTH_ENDPOINTS.selectTenant,
      { tenantSelectionToken, tenantId },
      { skipAuth: true, skipAuthRefresh: true },
    );
    return parseLoginOutcome(response);
  },

  async selectCompany(companySelectionToken: string, companyId: number): Promise<AuthResponse> {
    const response = await apiService.post<unknown, {
      companySelectionToken: string;
      companyId: number;
    }>(
      AUTH_ENDPOINTS.selectCompany,
      { companySelectionToken, companyId },
      { skipAuth: true, skipAuthRefresh: true },
    );
    return parseAuthResponse(response);
  },

  async switchCompany(companyId: number): Promise<AuthResponse> {
    // A refresh that started before the transition can otherwise finish after the
    // switch and overwrite the replacement credentials with the previous scope.
    // The transition guard prevents new ordinary refreshes while this one settles.
    if (refreshInFlight) {
      try {
        await refreshInFlight;
      } catch {
        // Let the switch request report the current connectivity/authentication
        // result instead of failing because an unrelated request refreshed first.
      }
    }

    const response = await apiService.post<unknown, { companyId: number }>(
      AUTH_ENDPOINTS.switchCompany,
      { companyId },
      { allowWhenReadOnly: true, allowAuthTransitionRefresh: true },
    );
    return parseAuthResponse(response);
  },

  async session(): Promise<SessionResponse> {
    const response = await apiService.get<unknown>(AUTH_ENDPOINTS.session);
    return parseSessionResponse(response);
  },

  async getUserPhoto(): Promise<UserPhoto> {
    const response = await apiService.get<unknown>(AUTH_ENDPOINTS.userPhoto);
    return parseUserPhoto(response);
  },

  async logout(): Promise<void> {
    const refreshToken = await secureSession.getRefreshToken();
    if (!refreshToken) {
      return;
    }

    await apiService.post<void, { refreshToken: string }>(
      AUTH_ENDPOINTS.logout,
      { refreshToken },
      { skipAuthRefresh: true, allowWhenReadOnly: true },
    );
  },

  refreshSession(): Promise<string | null> {
    if (!refreshInFlight) {
      refreshInFlight = performRefresh().finally(() => {
        refreshInFlight = null;
      });
    }

    return refreshInFlight;
  },
};

async function performRefresh(): Promise<string | null> {
  const [token, refreshToken] = await Promise.all([
    secureSession.getAccessToken(),
    secureSession.getRefreshToken(),
  ]);

  if (!token || !refreshToken) {
    return null;
  }

  try {
    const response = await apiService.post<unknown, { token: string; refreshToken: string }>(
      AUTH_ENDPOINTS.refreshToken,
      { token, refreshToken },
      { skipAuth: true, skipAuthRefresh: true, allowWhenReadOnly: true },
    );
    const authResponse = parseAuthResponse(response);
    await secureSession.setTokens(authResponse.token, authResponse.refreshToken);
    return authResponse.token;
  } catch (error) {
    const apiError = toApiError(error);
    if (isDefinitiveAuthenticationFailure(apiError)) {
      return null;
    }

    throw apiError;
  }
}

function isDefinitiveAuthenticationFailure(error: ApiError): boolean {
  return error.status === 400 || error.status === 401 || error.status === 403;
}
