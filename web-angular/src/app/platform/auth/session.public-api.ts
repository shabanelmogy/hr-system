// Lazy authenticated consumers use this facade; root guards stay in public-api.ts.
export { AuthSession } from './state/auth-session';
export { BrowserMutationSecurity } from './services/browser-mutation-security';
export { BrowserAuthService } from './services/browser-auth-service';
export type { Session } from './types/auth-contracts';
