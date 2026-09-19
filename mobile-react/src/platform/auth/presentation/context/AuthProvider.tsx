import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
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
  offlineLeaseValidUntil: string | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [session, setSession] = useState<SessionResponse | null>(null);
  const [isSwitchingCompany, setIsSwitchingCompany] = useState(false);
  const [authority, setAuthority] = useState<AuthAuthority>(null);
  const [offlineLeaseValidUntil, setOfflineLeaseValidUntil] = useState<string | null>(null);
  const database = useOfflineDatabase();
  const connectivity = useConnectivity();
  const transitionGeneration = useRef(0);

  const beginLocalTransition = useCallback(() => {
    transitionGeneration.current += 1;
    return transitionGeneration.current;
  }, []);

  const isCurrentTransition = useCallback(
    (generation: number) => transitionGeneration.current === generation,
    [],
  );

  const expireOfflineAuthority = useCallback(() => {
    beginLocalTransition();
    queryClient.clear();
    setSession(null);
    setAuthority(null);
    setOfflineLeaseValidUntil(null);
    setStatus('unavailable');
  }, [beginLocalTransition]);

  const handleAuthFailure = useCallback(() => {
    beginLocalTransition();
    rotateAxiosRequestContext();
    void Promise.all([secureSession.clear(), offlineSessionLeaseUseCases.invalidate(), clearSensitiveFileCache()]);
    queryClient.clear();
    setSession(null);
    setStatus('unauthenticated');
    setAuthority(null);
    setOfflineLeaseValidUntil(null);
  }, [beginLocalTransition]);

  const bootstrap = useCallback(async () => {
    const generation = beginLocalTransition();
    const [token, refreshToken] = await Promise.all([
      secureSession.getAccessToken(),
      secureSession.getRefreshToken(),
    ]);

    if (!isCurrentTransition(generation)) return;
    if (!token || !refreshToken) {
      void clearSensitiveFileCache();
      setSession(null);
      setStatus('unauthenticated');
      setAuthority(null);
      setOfflineLeaseValidUntil(null);
      return;
    }

    setStatus('loading');
    try {
      const validated = await authApi.session();
      if (!isCurrentTransition(generation)) return;
      const validUntil = await offlineSessionLeaseUseCases.save(database, validated);
      if (!isCurrentTransition(generation)) return;
      setSession(validated);
      setAuthority('server');
      setOfflineLeaseValidUntil(validUntil);
      setStatus('authenticated');
    } catch (error) {
      if (isTemporaryFailure(error)) {
        const lease = await offlineSessionLeaseUseCases.loadSnapshot(database);
        if (!isCurrentTransition(generation)) return;
        if (lease) {
          setSession(lease.session);
          setOfflineLeaseValidUntil(lease.validUntil);
          setAuthority('offline-lease');
          setStatus('authenticated');
        } else {
          setSession(null);
          setAuthority(null);
          setOfflineLeaseValidUntil(null);
          setStatus('unavailable');
        }
        return;
      }

      if (isCurrentTransition(generation)) handleAuthFailure();
    }
  }, [beginLocalTransition, database, handleAuthFailure, isCurrentTransition]);

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

  const completeAuthentication = async (response: AuthResponse, generation: number) => {
    if (!isCurrentTransition(generation)) return;
    rotateAxiosRequestContext();
    queryClient.clear();
    await clearSensitiveFileCache();
    await offlineSessionLeaseUseCases.invalidate();
    if (!isCurrentTransition(generation)) return;
    await secureSession.setTokens(response.token, response.refreshToken);
    if (!isCurrentTransition(generation)) {
      await clearTokensIfOwned(response);
      return;
    }

    try {
      const validated = await authApi.session();
      if (!isCurrentTransition(generation)) {
        await clearTokensIfOwned(response);
        return;
      }
      const validUntil = await offlineSessionLeaseUseCases.save(database, validated);
      if (!isCurrentTransition(generation)) {
        if (validUntil) await offlineSessionLeaseUseCases.invalidateSnapshot(validated, validUntil);
        await clearTokensIfOwned(response);
        return;
      }
      setSession(validated);
      setAuthority('server');
      setOfflineLeaseValidUntil(validUntil);
    } catch (error) {
      if (!isCurrentTransition(generation)) return;
      if (!isTemporaryFailure(error)) {
        await secureSession.clear();
        queryClient.clear();
        setSession(null);
        setStatus('unauthenticated');
        setAuthority(null);
        setOfflineLeaseValidUntil(null);
        throw error;
      }

      setSession(null);
      setAuthority(null);
      setOfflineLeaseValidUntil(null);
      setStatus('unavailable');
      return;
    }

    if (isCurrentTransition(generation)) setStatus('authenticated');
  };

  const refreshSession = useCallback(async () => {
    const generation = beginLocalTransition();
    const refreshedSession = await authApi.session();
    if (!isCurrentTransition(generation)) return;
    const validUntil = await offlineSessionLeaseUseCases.save(database, refreshedSession);
    if (!isCurrentTransition(generation)) return;
    setSession(refreshedSession);
    setAuthority('server');
    setOfflineLeaseValidUntil(validUntil);
    setStatus('authenticated');
  }, [beginLocalTransition, database, isCurrentTransition]);

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
      if (nextState !== 'active' || status !== 'authenticated' || authority !== 'offline-lease') return;
      if (!offlineLeaseValidUntil || Date.parse(offlineLeaseValidUntil) <= Date.now()) {
        expireOfflineAuthority();
      } else if (connectivity.isOnline) {
        void refreshSession().catch((error) => {
          if (!isTemporaryFailure(error)) handleAuthFailure();
        });
      }
    });
    return () => subscription.remove();
  }, [authority, connectivity.isOnline, expireOfflineAuthority, handleAuthFailure,
    offlineLeaseValidUntil, refreshSession, status]);

  useEffect(() => {
    if (authority !== 'offline-lease' || !offlineLeaseValidUntil) return undefined;
    const remaining = Date.parse(offlineLeaseValidUntil) - Date.now();
    const delay = Number.isFinite(remaining) ? Math.max(0, remaining + 1) : 0;
    const timer = setTimeout(expireOfflineAuthority, delay);
    return () => clearTimeout(timer);
  }, [authority, expireOfflineAuthority, offlineLeaseValidUntil]);

  const signIn = async (request: LoginRequest): Promise<LoginOutcome> => {
    const generation = beginLocalTransition();
    const result = await authApi.login(request);
    if (result.kind === 'authenticated' && isCurrentTransition(generation)) {
      await completeAuthentication(result.response, generation);
    }
    return result;
  };

  const selectTenant = async (token: string, tenantId: string): Promise<LoginOutcome> => {
    const generation = beginLocalTransition();
    const result = await authApi.selectTenant(token, tenantId);
    if (result.kind === 'authenticated' && isCurrentTransition(generation)) {
      await completeAuthentication(result.response, generation);
    }
    return result;
  };

  const selectCompany = async (token: string, companyId: number) => {
    const generation = beginLocalTransition();
    const response = await authApi.selectCompany(token, companyId);
    await completeAuthentication(response, generation);
  };

  const switchCompany = async (companyId: number) => {
    if (!session || !session.companies.some((company) => company.id === companyId)) {
      throw new Error('Invalid company selection.');
    }
    if (companyId === session.companyId) return;

    const generation = beginLocalTransition();
    const endAuthenticationTransition = beginAxiosAuthenticationTransition();
    setIsSwitchingCompany(true);
    try {
      await queryClient.cancelQueries();
      const response = await authApi.switchCompany(companyId);
      await completeAuthentication(response, generation);
    } finally {
      endAuthenticationTransition();
      setIsSwitchingCompany(false);
    }
  };

  const signOut = async () => {
    const generation = beginLocalTransition();
    const endAuthenticationTransition = beginAxiosAuthenticationTransition();
    try {
      try {
        await authApi.logout();
      } finally {
        if (!isCurrentTransition(generation)) return;
        rotateAxiosRequestContext();
        await Promise.all([secureSession.clear(), offlineSessionLeaseUseCases.invalidate(), clearSensitiveFileCache()]);
        queryClient.clear();
        setSession(null);
        setStatus('unauthenticated');
        setAuthority(null);
        setOfflineLeaseValidUntil(null);
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
    offlineLeaseValidUntil,
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

async function clearTokensIfOwned(response: AuthResponse): Promise<void> {
  const [accessToken, refreshToken] = await Promise.all([
    secureSession.getAccessToken(),
    secureSession.getRefreshToken(),
  ]);
  if (accessToken === response.token && refreshToken === response.refreshToken) {
    await secureSession.clear();
  }
}

