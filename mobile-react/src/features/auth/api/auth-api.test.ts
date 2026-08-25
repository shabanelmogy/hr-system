import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { apiService } from '@/src/core/api';
import { secureSession } from '@/src/core/storage/secure-storage';
import { AUTH_ENDPOINTS } from '@/src/features/auth/constants/auth-endpoints';
import type { AuthResponse } from '@/src/features/auth/types/auth';

import { authApi } from './auth-api';

const refreshedResponse = createAuthResponse(1, 'old-company-refreshed');
const switchedResponse = createAuthResponse(2, 'new-company-access');

describe('auth API company switching', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('waits for an existing refresh before issuing the switch request', async () => {
    const events: string[] = [];
    const refreshStarted = deferred<void>();
    const refreshResponse = deferred<AuthResponse>();

    jest.spyOn(secureSession, 'getAccessToken').mockResolvedValue('old-company-access');
    jest.spyOn(secureSession, 'getRefreshToken').mockResolvedValue('old-company-refresh');
    jest.spyOn(secureSession, 'setTokens').mockResolvedValue();
    jest.spyOn(apiService, 'post').mockImplementation((async (url: string) => {
      if (url === AUTH_ENDPOINTS.refreshToken) {
        events.push('refresh');
        refreshStarted.resolve();
        return refreshResponse.promise;
      }
      if (url === AUTH_ENDPOINTS.switchCompany) {
        events.push('switch');
        return switchedResponse;
      }
      throw new Error(`Unexpected endpoint: ${url}`);
    }) as typeof apiService.post);

    const activeRefresh = authApi.refreshSession();
    await refreshStarted.promise;

    const activeSwitch = authApi.switchCompany(2);
    await Promise.resolve();
    expect(events).toEqual(['refresh']);

    refreshResponse.resolve(refreshedResponse);
    await activeRefresh;
    await expect(activeSwitch).resolves.toMatchObject({
      companyId: 2,
      token: 'new-company-access',
    });
    expect(events).toEqual(['refresh', 'switch']);
  });
});

function createAuthResponse(companyId: number, token: string): AuthResponse {
  return {
    id: 'user-id',
    userName: 'user',
    firstName: 'Test',
    lastName: 'User',
    tenantId: 'tenant-id',
    tenantName: 'Tenant',
    tenantPlanName: 'Professional',
    companyId,
    companyCode: `COMP-${companyId}`,
    companyNameAr: `الشركة ${companyId}`,
    companyNameEn: `Company ${companyId}`,
    token,
    tokenExpiration: '2026-08-25T12:00:00Z',
    refreshToken: `${token}-refresh`,
    refreshTokenExpiration: '2026-09-25T12:00:00Z',
  };
}

function deferred<T>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}
