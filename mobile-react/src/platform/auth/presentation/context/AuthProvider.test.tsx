import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Pressable, Text, View } from 'react-native';

import type { AuthResponse, LoginOutcome, SessionResponse } from '@/src/platform/auth/domain/models/auth';
import { AuthProvider, useAuth } from './AuthProvider';

const mockCancelQueries = jest.fn();
const mockClearQueries = jest.fn();
const mockGetAccessToken = jest.fn();
const mockGetRefreshToken = jest.fn();
const mockSetTokens = jest.fn();
const mockClearSession = jest.fn();
const mockClearSensitiveFileCache = jest.fn();
const mockSession = jest.fn();
const mockSwitchCompany = jest.fn();
const mockLogin = jest.fn();
const mockLogout = jest.fn();
const mockBeginTransition = jest.fn(() => jest.fn());
const mockRotateContext = jest.fn();

jest.mock('@/src/core/query/query-client', () => ({
  queryClient: {
    cancelQueries: (...args: unknown[]) => mockCancelQueries(...args),
    clear: (...args: unknown[]) => mockClearQueries(...args),
  },
}));

jest.mock('@/src/core/storage/secure-storage', () => ({
  secureSession: {
    clear: (...args: unknown[]) => mockClearSession(...args),
    getAccessToken: (...args: unknown[]) => mockGetAccessToken(...args),
    getRefreshToken: (...args: unknown[]) => mockGetRefreshToken(...args),
    setTokens: (...args: unknown[]) => mockSetTokens(...args),
  },
}));

jest.mock('@/src/core/storage/sensitive-file-cache', () => ({
  clearSensitiveFileCache: (...args: unknown[]) => mockClearSensitiveFileCache(...args),
}));

jest.mock('@/src/core/api', () => {
  class ApiError extends Error {
    readonly status: number;

    constructor(code: number, message: string) {
      super(message);
      this.status = code;
    }
  }

  return {
    ApiError,
    beginAxiosAuthenticationTransition: () => mockBeginTransition(),
    configureAxiosAuthentication: jest.fn(() => jest.fn()),
    rotateAxiosRequestContext: () => mockRotateContext(),
  };
});

jest.mock('@/src/platform/auth/composition/auth-container', () => ({
  authUseCases: {
    login: (...args: unknown[]) => mockLogin(...args),
    logout: (...args: unknown[]) => mockLogout(...args),
    refreshSession: jest.fn(),
    selectCompany: jest.fn(),
    selectTenant: jest.fn(),
    session: (...args: unknown[]) => mockSession(...args),
    switchCompany: (...args: unknown[]) => mockSwitchCompany(...args),
  },
}));

function AuthProbe() {
  const auth = useAuth();
  return (
    <View>
      <Text testID="auth-status">{auth.status}</Text>
      <Text testID="auth-user">{auth.session?.userId ?? 'none'}</Text>
      <Text testID="auth-company">{String(auth.session?.companyId ?? 0)}</Text>
      <Pressable onPress={() => void auth.switchCompany(2)} testID="switch-company" />
      <Pressable
        onPress={() => void auth.signIn({ userName: 'user-b', password: 'secret' })}
        testID="sign-in-user-b"
      />
      <Pressable
        onPress={() => void auth.signIn({ userName: 'user-c', password: 'secret' })}
        testID="sign-in-user-c"
      />
      <Pressable onPress={() => void auth.signOut().catch(() => undefined)} testID="sign-out" />
    </View>
  );
}

describe('AuthProvider context isolation', () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    // React Native Testing Library in this project does not mark timer-driven
    // provider bootstrap work as an act environment; keep the test output
    // focused while assertions still wait for the observable state changes.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAccessToken.mockResolvedValue('user-a-access');
    mockGetRefreshToken.mockResolvedValue('user-a-refresh');
    mockSetTokens.mockResolvedValue(undefined);
    mockClearSession.mockResolvedValue(undefined);
    mockClearSensitiveFileCache.mockResolvedValue(undefined);
    mockCancelQueries.mockResolvedValue(undefined);
    mockLogout.mockResolvedValue(undefined);
  });

  it('cancels old work, clears query data, and exposes only the new company session', async () => {
    const companyOne = createSession('user-a', 1);
    const companyTwo = createSession('user-a', 2);
    mockSession
      .mockResolvedValueOnce(companyOne)
      .mockResolvedValueOnce(companyTwo);
    mockSwitchCompany.mockResolvedValue(createAuthResponse('user-a', 2));

    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('auth-status').props.children).toBe('authenticated'));
    expect(screen.getByTestId('auth-company').props.children).toBe('1');

    fireEvent.press(screen.getByTestId('switch-company'));

    await waitFor(() => expect(screen.getByTestId('auth-company').props.children).toBe('2'));
    expect(mockCancelQueries).toHaveBeenCalledTimes(1);
    expect(mockClearQueries).toHaveBeenCalledTimes(1);
    expect(mockSetTokens).toHaveBeenCalledWith('user-a-company-2-access', 'user-a-company-2-refresh');
    expect(mockBeginTransition).toHaveBeenCalledTimes(1);
  });

  it('clears the previous user query cache before exposing a newly authenticated user', async () => {
    const userA = createSession('user-a', 1);
    const userB = createSession('user-b', 1);
    mockSession
      .mockResolvedValueOnce(userA)
      .mockResolvedValueOnce(userB);
    const loginOutcome: LoginOutcome = {
      kind: 'authenticated',
      response: createAuthResponse('user-b', 1),
    };
    mockLogin.mockResolvedValue(loginOutcome);

    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('auth-user').props.children).toBe('user-a'));
    fireEvent.press(screen.getByTestId('sign-in-user-b'));

    await waitFor(() => expect(screen.getByTestId('auth-user').props.children).toBe('user-b'));
    expect(mockClearQueries).toHaveBeenCalledTimes(1);
    expect(mockRotateContext).toHaveBeenCalledTimes(1);
    expect(mockSetTokens).toHaveBeenCalledWith('user-b-company-1-access', 'user-b-company-1-refresh');
  });

  it('clears local query/session state on sign-out even when the server logout fails', async () => {
    mockSession.mockResolvedValueOnce(createSession('user-a', 1));
    mockLogout.mockRejectedValueOnce(new Error('network failed'));

    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => expect(screen.getByTestId('auth-status').props.children).toBe('authenticated'));
    fireEvent.press(screen.getByTestId('sign-out'));

    await waitFor(() => expect(screen.getByTestId('auth-status').props.children).toBe('unauthenticated'));
    expect(screen.getByTestId('auth-user').props.children).toBe('none');
    expect(mockClearSession).toHaveBeenCalledTimes(1);
    expect(mockClearQueries).toHaveBeenCalledTimes(1);
    expect(mockRotateContext).toHaveBeenCalled();
  });

  it('ignores an older login response that completes after a newer authentication transition', async () => {
    mockSession
      .mockResolvedValueOnce(createSession('user-a', 1))
      .mockResolvedValueOnce(createSession('user-c', 1));
    let resolveOlderLogin!: (value: LoginOutcome) => void;
    const olderLogin = new Promise<LoginOutcome>((resolve) => { resolveOlderLogin = resolve; });
    mockLogin
      .mockReturnValueOnce(olderLogin)
      .mockResolvedValueOnce({ kind: 'authenticated', response: createAuthResponse('user-c', 1) });

    await render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );
    await waitFor(() => expect(screen.getByTestId('auth-user').props.children).toBe('user-a'));

    fireEvent.press(screen.getByTestId('sign-in-user-b'));
    fireEvent.press(screen.getByTestId('sign-in-user-c'));
    await waitFor(() => expect(screen.getByTestId('auth-user').props.children).toBe('user-c'));

    resolveOlderLogin({ kind: 'authenticated', response: createAuthResponse('user-b', 1) });
    await waitFor(() => expect(mockLogin).toHaveBeenCalledTimes(2));
    expect(screen.getByTestId('auth-user').props.children).toBe('user-c');
    expect(mockSetTokens).toHaveBeenCalledTimes(1);
    expect(mockSetTokens).toHaveBeenCalledWith('user-c-company-1-access', 'user-c-company-1-refresh');
  });
});

function createSession(userId: string, companyId: number): SessionResponse {
  return {
    userId,
    tenantId: 'tenant-a',
    tenantName: 'Tenant A',
    tenantPlanName: 'Professional',
    companyId,
    companyCode: `COMP-${companyId}`,
    companyNameAr: `Ø§Ù„Ø´Ø±ÙƒØ© ${companyId}`,
    companyNameEn: `Company ${companyId}`,
    companies: [
      { id: 1, companyCode: 'COMP-1', nameAr: 'Ø§Ù„Ø´Ø±ÙƒØ© 1', nameEn: 'Company 1' },
      { id: 2, companyCode: 'COMP-2', nameAr: 'Ø§Ù„Ø´Ø±ÙƒØ© 2', nameEn: 'Company 2' },
    ],
    userName: userId,
    email: `${userId}@example.com`,
    firstName: 'Test',
    lastName: 'User',
    roles: [],
    permissions: [],
    tenantSubscriptionStatus: 'active',
    tenantSubscriptionEndsOn: null,
    tenantReadOnly: false,
    expiresAt: Date.parse('2026-12-01T00:00:00Z'),
  };
}

function createAuthResponse(userId: string, companyId: number): AuthResponse {
  return {
    id: userId,
    userName: userId,
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'tenant-a',
    tenantName: 'Tenant A',
    tenantPlanName: 'Professional',
    companyId,
    companyCode: `COMP-${companyId}`,
    companyNameAr: `Ø§Ù„Ø´Ø±ÙƒØ© ${companyId}`,
    companyNameEn: `Company ${companyId}`,
    token: `${userId}-company-${companyId}-access`,
    tokenExpiration: '2026-12-01T00:00:00Z',
    refreshToken: `${userId}-company-${companyId}-refresh`,
    refreshTokenExpiration: '2027-01-01T00:00:00Z',
  };
}

