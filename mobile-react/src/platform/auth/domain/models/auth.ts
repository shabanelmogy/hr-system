export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  password: string;
  profilePicture: string | null;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ConfirmEmailRequest {
  userId: string;
  code: string;
}

export interface AcceptInvitationRequest {
  invitationId: string;
  token: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  tenantName: string;
  tenantPlanName: string;
  companyId: number;
  companyCode: string;
  companyNameAr: string;
  companyNameEn: string;
  token: string;
  tokenExpiration: string;
  refreshToken: string;
  refreshTokenExpiration: string;
}

export interface TenantOption {
  id: string;
  identifier: string;
  name: string;
}

export interface TenantSelectionResponse {
  isAuthenticated: false;
  requiresTenantSelection: true;
  tenantSelectionToken: string;
  tenantSelectionTokenExpiration: string;
  tenants: TenantOption[];
}

export interface CompanyOption {
  id: number;
  companyCode: string;
  nameAr: string;
  nameEn: string;
}

export interface CompanySelectionResponse {
  isAuthenticated: false;
  requiresCompanySelection: true;
  companySelectionToken: string;
  companySelectionTokenExpiration: string;
  companies: CompanyOption[];
}

export interface SessionResponse {
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantPlanName: string;
  companyId: number;
  companyCode: string;
  companyNameAr: string;
  companyNameEn: string;
  readonly companies: readonly CompanyOption[];
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  readonly roles: readonly string[];
  readonly permissions: readonly string[];
  tenantSubscriptionStatus: string;
  tenantSubscriptionEndsOn: string | null;
  tenantReadOnly: boolean;
  expiresAt: number;
}

export interface UserPhoto {
  profilePicture: string | null;
  contentType: string | null;
}

export type LoginOutcome =
  | { kind: 'authenticated'; response: AuthResponse }
  | { kind: 'company-selection'; response: CompanySelectionResponse }
  | { kind: 'tenant-selection'; response: TenantSelectionResponse };
