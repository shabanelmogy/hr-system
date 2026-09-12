import type {
  AcceptInvitationRequest,
  AuthResponse,
  ConfirmEmailRequest,
  LoginOutcome,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SessionResponse,
  UserPhoto,
} from '../models/auth';

export interface AuthRepository {
  register(request: RegisterRequest): Promise<void>;
  forgetPassword(email: string): Promise<void>;
  resetPassword(request: ResetPasswordRequest): Promise<void>;
  confirmEmail(request: ConfirmEmailRequest): Promise<void>;
  acceptInvitation(request: AcceptInvitationRequest): Promise<void>;
  resendConfirmationEmail(email: string): Promise<void>;
  login(request: LoginRequest): Promise<LoginOutcome>;
  selectTenant(tenantSelectionToken: string, tenantId: string): Promise<LoginOutcome>;
  selectCompany(companySelectionToken: string, companyId: number): Promise<AuthResponse>;
  switchCompany(companyId: number): Promise<AuthResponse>;
  session(): Promise<SessionResponse>;
  getUserPhoto(): Promise<UserPhoto>;
  logout(): Promise<void>;
  refreshSession(): Promise<string | null>;
}
