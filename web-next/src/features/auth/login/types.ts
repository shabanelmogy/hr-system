export type SocialProvider = "google";

export type SocialLoginHandler = (
  provider: SocialProvider,
  credentialResponse?: unknown,
) => Promise<void>;

export interface LoginResponse {
  isAuthenticated: boolean;
}
