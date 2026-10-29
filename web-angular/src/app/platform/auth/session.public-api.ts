// Lazy authenticated consumers use this facade; root guards stay in public-api.ts.
export { AuthSession } from './state/auth-session';
export { BrowserMutationSecurity } from './services/browser-mutation-security';
export { SessionPage } from './pages/session-page';
export type { Session } from './types/auth-contracts';
