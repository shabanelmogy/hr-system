import React from 'react';
import { render } from '@testing-library/react-native';
import { useAuth } from '@/src/platform/auth';
import { startClientErrorLogCapture } from '../../composition/client-error-log-capture';
import { ErrorLogCaptureBridge } from './ErrorLogCaptureBridge';

jest.mock('@/src/platform/auth', () => ({ useAuth: jest.fn() }));
jest.mock('../../composition/client-error-log-capture', () => ({ startClientErrorLogCapture: jest.fn() }));

describe('authenticated capture lifetime', () => {
  const stop = jest.fn();
  const session: NonNullable<ReturnType<typeof useAuth>['session']> = {
    userId: 'u1', tenantId: 't1', companyId: 1, roles: ['admin'], permissions: [],
    tenantName: 'Tenant', tenantPlanName: 'Plan', companyCode: 'C1', companyNameAr: 'شركة',
    companyNameEn: 'Company', companies: [], userName: 'admin', email: 'admin@example.test',
    firstName: 'Admin', lastName: 'User', tenantSubscriptionStatus: 'active',
    tenantSubscriptionEndsOn: null, tenantReadOnly: false, expiresAt: 9999999999,
  };
  const state: ReturnType<typeof useAuth> = {
    session, status: 'authenticated', authority: 'server', offlineLeaseValidUntil: null,
    isServerAuthenticated: true, isSwitchingCompany: false,
    signIn: jest.fn(), selectCompany: jest.fn(), switchCompany: jest.fn(),
    selectTenant: jest.fn(), signOut: jest.fn(), retry: jest.fn(), refreshSession: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
    jest.mocked(useAuth).mockReturnValue(state);
    jest.mocked(startClientErrorLogCapture).mockReturnValue(stop);
  });
  it('disposes the old company scope before enabling a new one', async () => {
    const view = await render(<ErrorLogCaptureBridge />);
    expect(startClientErrorLogCapture).toHaveBeenCalledTimes(1);
    jest.mocked(useAuth).mockReturnValue({ ...state, isSwitchingCompany: true });
    await view.rerender(<ErrorLogCaptureBridge />);
    expect(stop).toHaveBeenCalledTimes(1);
    jest.mocked(useAuth).mockReturnValue({ ...state, session: { ...session, companyId: 2 } });
    await view.rerender(<ErrorLogCaptureBridge />);
    expect(startClientErrorLogCapture).toHaveBeenCalledTimes(2);
    await view.unmount(); expect(stop).toHaveBeenCalledTimes(2);
  });
  it('does not let an offline session enable online error transport', async () => {
    jest.mocked(useAuth).mockReturnValue({ ...state, isServerAuthenticated: false });
    await render(<ErrorLogCaptureBridge />);
    expect(startClientErrorLogCapture).not.toHaveBeenCalled();
  });
});
