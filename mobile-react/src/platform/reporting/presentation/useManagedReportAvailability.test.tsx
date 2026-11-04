import { renderHook } from '@testing-library/react-native';

const mockState = {
  platformAllowed: false,
  companyAllowed: true,
  reportingAccessible: true,
  session: { userId: 'user-a', tenantId: 'tenant-a', companyId: 1, roles: ['employee'] },
};
const mockModuleQuery = jest.fn();
const mockAuthorization = jest.fn();

jest.mock('@/src/platform/auth', () => ({
  ...jest.requireActual('@/src/platform/auth/presentation/rbac/permissions'),
  appRoles: { superAdmin: 'super_admin' },
  useAuth: () => ({ session: mockState.session }),
  useAuthorization: (options: { permissionMode?: string }) => {
    mockAuthorization(options);
    return { allowed: options.permissionMode === 'all' ? mockState.companyAllowed : mockState.platformAllowed, isLoading: false };
  },
}));
jest.mock('@/src/platform/modules', () => ({
  useAccessibleModules: (enabled: boolean) => {
    mockModuleQuery(enabled);
    return { data: mockState.reportingAccessible ? [{ code: 'reporting' }] : [], isLoading: false };
  },
}));

import { useManagedReportAvailability } from './useManagedReportAvailability';

describe('global company report availability', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockState.platformAllowed = false;
    mockState.companyAllowed = true;
    mockState.reportingAccessible = true;
    mockState.session = { userId: 'user-a', tenantId: 'tenant-a', companyId: 1, roles: ['employee'] };
  });

  it('requires report and entity permission plus an accessible Reporting module', async () => {
    const { result, rerender } = await renderHook(() => useManagedReportAvailability('global', 'countries'));
    expect(result.current.allowed).toBe(true);
    expect(result.current.companyConsumer).toBe(true);
    expect(mockAuthorization).toHaveBeenCalledWith({ requiredPermissions: ['CrystalReports:View', 'Countries:View'], permissionMode: 'all' });
    expect(mockModuleQuery).toHaveBeenLastCalledWith(true);
    mockState.reportingAccessible = false;
    await rerender({});
    expect(result.current.allowed).toBe(false);
    mockState.reportingAccessible = true;
    mockState.companyAllowed = false;
    await rerender({});
    expect(result.current.allowed).toBe(false);
  });

  it('does not downgrade super admins or expose unsupported entities', async () => {
    mockState.session.roles = ['super_admin'];
    const { result } = await renderHook(() => useManagedReportAvailability('global', 'countries'));
    expect(result.current.allowed).toBe(false);
    expect(mockModuleQuery).toHaveBeenLastCalledWith(false);
    mockState.session.roles = ['employee'];
    const unsupported = await renderHook(() => useManagedReportAvailability('global', 'employees'));
    expect(unsupported.result.current.allowed).toBe(false);
  });

  it('separates cached catalogs when the company changes', async () => {
    const { result, rerender } = await renderHook(() => useManagedReportAvailability('global', 'countries'));
    const first = result.current.scopeKey;
    mockState.session.companyId = 2;
    await rerender({});
    expect(result.current.scopeKey).not.toBe(first);
  });
});
