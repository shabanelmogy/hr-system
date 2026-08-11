export interface LoginRequest {
  userName: string;
  password: string;
}

export interface AuthResponse {
  id: string;
  userName: string;
  firstName: string;
  lastName: string;
  tenantId: string;
  companyId: number;
  token: string;
  tokenExpiration: string;
  refreshToken: string;
  refreshTokenExpiration: string;
}

export interface CompanyOption {
  id: number;
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
  companyId: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  permissions: string[];
  expiresAt: number;
}

export type LoginOutcome =
  | { kind: 'authenticated'; response: AuthResponse }
  | { kind: 'company-selection'; response: CompanySelectionResponse };
