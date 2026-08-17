import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { ApiError, configureAxiosAuthentication } from '@/src/core/api';
import { queryClient } from '@/src/core/query/query-client';
import { secureSession } from '@/src/core/storage/secure-storage';
import { clearSensitiveFileCache } from '@/src/core/storage/sensitive-file-cache';
import { authApi } from '@/src/features/auth/api/auth-api';
import type {
  AuthResponse,
  LoginOutcome,
  LoginRequest,
  SessionResponse,
} from '@/src/features/auth/types/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unavailable';

interface AuthContextValue {
  status: AuthStatus;
  session: SessionResponse | null;
  signIn: (request: LoginRequest) => Promise<LoginOutcome>;
  selectCompany: (token: string, companyId: number) => Promise<void>;
  selectTenant: (token: string, tenantId: string) => Promise<LoginOutcome>;
  signOut: () => Promise<void>;
  retry: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<SessionResponse | null>(null);

  const handleAuthFailure = useCallback(() => {
    void Promise.all([secureSession.clear(), clearSensitiveFileCache()]);
    queryClient.clear();
    setSession(null);
    setStatus('unauthenticated');
  }, []);

  const bootstrap = useCallback(async () => {
    const [token, refreshToken] = await Promise.all([
      secureSession.getAccessToken(),
      secureSession.getRefreshToken(),
    ]);

    if (!token || !refreshToken) {
      void clearSensitiveFileCache();
      setSession(null);
      setStatus('unauthenticated');
      return;
    }

    setStatus('loading');
    try {
      setSession(await authApi.session());
      setStatus('authenticated');
    } catch (error) {
      if (isTemporaryFailure(error)) {
        setStatus('unavailable');
        return;
      }

      handleAuthFailure();
    }
  }, [handleAuthFailure]);

  useEffect(
    () =>
      configureAxiosAuthentication({
        refresh: authApi.refreshSession,
        onAuthFailure: handleAuthFailure,
      }),
    [handleAuthFailure],
  );

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  const completeAuthentication = async (response: AuthResponse) => {
    queryClient.clear();
    await clearSensitiveFileCache();
    await secureSession.setTokens(response.token, response.refreshToken);

    try {
      setSession(await authApi.session());
    } catch (error) {
      if (!isTemporaryFailure(error)) {
        await secureSession.clear();
        throw error;
      }

      setSession(createProvisionalSession(response));
    }

    setStatus('authenticated');
  };

  const refreshSession = useCallback(async () => {
    const refreshedSession = await authApi.session();
    setSession(refreshedSession);
    setStatus('authenticated');
  }, []);

  const signIn = async (request: LoginRequest): Promise<LoginOutcome> => {
    const result = await authApi.login(request);
    if (result.kind === 'authenticated') {
      await completeAuthentication(result.response);
    }
    return result;
  };

  const selectTenant = async (token: string, tenantId: string): Promise<LoginOutcome> => {
    const result = await authApi.selectTenant(token, tenantId);
    if (result.kind === 'authenticated') {
      await completeAuthentication(result.response);
    }
    return result;
  };

  const selectCompany = async (token: string, companyId: number) => {
    await completeAuthentication(await authApi.selectCompany(token, companyId));
  };

  const signOut = async () => {
    try {
      await authApi.logout();
    } finally {
      await Promise.all([secureSession.clear(), clearSensitiveFileCache()]);
      queryClient.clear();
      setSession(null);
      setStatus('unauthenticated');
    }
  };

  const value: AuthContextValue = {
    status,
    session,
    signIn,
    selectCompany,
    selectTenant,
    signOut,
    retry: bootstrap,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}

function isTemporaryFailure(error: unknown): boolean {
  return (
    error instanceof ApiError &&
    (error.status === 0 || error.status === 408 || error.status === 429 || error.status >= 500)
  );
}

function createProvisionalSession(response: AuthResponse): SessionResponse {
  return {
    userId: response.id,
    tenantId: response.tenantId,
    tenantName: response.tenantName,
    tenantPlanName: response.tenantPlanName,
    companyId: response.companyId,
    userName: response.userName,
    email: '',
    firstName: response.firstName,
    lastName: response.lastName,
    roles: [],
    permissions: [],
    tenantSubscriptionStatus: 'active',
    tenantSubscriptionEndsOn: null,
    tenantReadOnly: false,
    expiresAt: Date.parse(response.tokenExpiration),
  };
}
