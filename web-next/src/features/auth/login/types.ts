export type SocialProvider = "google";

export type SocialLoginHandler = (
  provider: SocialProvider,
  credentialResponse?: unknown,
) => Promise<void>;

export interface LoginResponse {
  isAuthenticated: boolean;
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
