export type SocialProvider = "google";

export type SocialLoginHandler = (
  provider: SocialProvider,
  credentialResponse?: unknown,
) => Promise<void>;

export interface AuthenticatedLoginResponse {
  isAuthenticated: true;
  companyId: number;
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
