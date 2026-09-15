import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AppState } from 'react-native';

import {
  ApiError,
  beginAxiosAuthenticationTransition,
  configureAxiosAuthentication,
  rotateAxiosRequestContext,
} from '@/src/core/api';
import { useConnectivity, useOfflineDatabase } from '@/src/core/offline';
import { queryClient } from '@/src/core/query/query-client';
import { secureSession } from '@/src/core/storage/secure-storage';
import { clearSensitiveFileCache } from '@/src/core/storage/sensitive-file-cache';
import { authUseCases as authApi } from '../../composition/auth-container';
import { offlineSessionLeaseUseCases } from '../../composition/offline-session-lease-composition';
import type {
  AuthResponse,
  LoginOutcome,
  LoginRequest,
  SessionResponse,
} from '../../domain/models/auth';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated' | 'unavailable';
type AuthAuthority = 'server' | 'offline-lease' | null;

interface AuthContextValue {
  status: AuthStatus;
  session: SessionResponse | null;
  signIn: (request: LoginRequest) => Promise<LoginOutcome>;
  selectCompany: (token: string, companyId: number) => Promise<void>;
  switchCompany: (companyId: number) => Promise<void>;
  isSwitchingCompany: boolean;
  selectTenant: (token: string, tenantId: string) => Promise<LoginOutcome>;
  signOut: () => Promise<void>;
  retry: () => Promise<void>;
  refreshSession: () => Promise<void>;
  authority: AuthAuthority;
  isServerAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [isSwitchingCompany, setIsSwitchingCompany] = useState(false);
  const [authority, setAuthority] = useState<AuthAuthority>(null);
  const database = useOfflineDatabase();
  const connectivity = useConnectivity();

  const handleAuthFailure = useCallback(() => {
    rotateAxiosRequestContext();
    void Promise.all([secureSession.clear(), offlineSessionLeaseUseCases.invalidate(), clearSensitiveFileCache()]);
    queryClient.clear();
    setSession(null);
    setStatus('unauthenticated');
    setAuthority(null);
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
      setAuthority(null);
      return;
    }

    setStatus('loading');
    try {
      const validated = await authApi.session();
      setSession(validated);
      setAuthority('server');
      await offlineSessionLeaseUseCases.save(database, validated);
      setStatus('authenticated');
    } catch (error) {
      if (isTemporaryFailure(error)) {
        const lease = await offlineSessionLeaseUseCases.load(database);
        if (lease) {
          setSession(lease);
          setAuthority('offline-lease');
          setStatus('authenticated');
        } else {
          setSession(null);
          setAuthority(null);
          setStatus('unavailable');
        }
        return;
      }

      handleAuthFailure();
    }
  }, [database, handleAuthFailure]);

  useEffect(
    () =>
      configureAxiosAuthentication({
        refresh: authApi.refreshSession,
        onAuthFailure: handleAuthFailure,
      }),
    [handleAuthFailure],
  );

  useEffect(() => {
    const timer = setTimeout(() => void bootstrap(), 0);
    return () => clearTimeout(timer);
  }, [bootstrap]);

  const completeAuthentication = async (response: AuthResponse) => {
    rotateAxiosRequestContext();
    queryClient.clear();
    await clearSensitiveFileCache();
    await offlineSessionLeaseUseCases.invalidate();
    await secureSession.setTokens(response.token, response.refreshToken);

    try {
      const validated = await authApi.session();
      setSession(validated);
      setAuthority('server');
      await offlineSessionLeaseUseCases.save(database, validated);
    } catch (error) {
      if (!isTemporaryFailure(error)) {
        await secureSession.clear();
        queryClient.clear();
        setSession(null);
        setStatus('unauthenticated');
        throw error;
      }

      setSession(null);
      setAuthority(null);
      setStatus('unavailable');
      return;
    }

    setStatus('authenticated');
  };

  const refreshSession = useCallback(async () => {
    const refreshedSession = await authApi.session();
    setSession(refreshedSession);
    setAuthority('server');
    await offlineSessionLeaseUseCases.save(database, refreshedSession);
    setStatus('authenticated');
  }, [database]);

  useEffect(() => {
    if (!connectivity.isOnline || status !== 'authenticated' || authority === 'server') return undefined;
    let cancelled = false;
    const timer = setTimeout(() => {
      void refreshSession().catch((error) => {
        if (!cancelled && !isTemporaryFailure(error)) handleAuthFailure();
      });
    }, 0);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [authority, connectivity.isOnline, handleAuthFailure, refreshSession, status]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active' && connectivity.isOnline && status === 'authenticated' && authority === 'offline-lease') {
        void refreshSession().catch((error) => {
          if (!isTemporaryFailure(error)) handleAuthFailure();
        });
      }
    });
    return () => subscription.remove();
  }, [authority, connectivity.isOnline, handleAuthFailure, refreshSession, status]);

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

  const switchCompany = async (companyId: number) => {
    if (!session || !session.companies.some((company) => company.id === companyId)) {
      throw new Error('Invalid company selection.');
    }
    if (companyId === session.companyId) return;

    const endAuthenticationTransition = beginAxiosAuthenticationTransition();
    setIsSwitchingCompany(true);
    try {
      await queryClient.cancelQueries();
      await completeAuthentication(await authApi.switchCompany(companyId));
    } finally {
      endAuthenticationTransition();
      setIsSwitchingCompany(false);
    }
  };

  const signOut = async () => {
    const endAuthenticationTransition = beginAxiosAuthenticationTransition();
    try {
      try {
        await authApi.logout();
      } finally {
        rotateAxiosRequestContext();
        await Promise.all([secureSession.clear(), offlineSessionLeaseUseCases.invalidate(), clearSensitiveFileCache()]);
        queryClient.clear();
        setSession(null);
        setStatus('unauthenticated');
        setAuthority(null);
      }
    } finally {
      endAuthenticationTransition();
    }
  };

  const value: AuthContextValue = {
    status,
    session,
    signIn,
    selectCompany,
    switchCompany,
    isSwitchingCompany,
    selectTenant,
    signOut,
    retry: bootstrap,
    refreshSession,
    authority,
    isServerAuthenticated: status === 'authenticated' && authority === 'server',
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

