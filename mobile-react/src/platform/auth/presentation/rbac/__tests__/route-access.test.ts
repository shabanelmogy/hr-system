import { describe, expect, it } from '@jest/globals';

import { ROUTES } from '@/src/core/constants/routes';
import { getAuthorizationState, type AuthorizationClaims } from '../authorization';
import { permissions } from '../permissions';
import { canAccessRoute, getRoutePolicy, requiredModuleForPath } from '../route-access';
import { MAIN_DRAWER_ROUTES } from '../route-manifest';
import { appRoles } from '../roles';

const userWith = ({
  roles = [appRoles.user],
  permissionClaims = [],
}: {
  roles?: readonly string[];
  permissionClaims?: readonly string[];
} = {}): AuthorizationClaims => ({ roles, permissions: permissionClaims });

describe('route access manifest', () => {
  it('maps business routes to the matching commercial submodule', () => {
    expect(requiredModuleForPath('/apps/hr/recruitment')).toEqual({
      moduleCode: 'hr',
      submoduleCode: 'recruitment',
    });
    expect(requiredModuleForPath(ROUTES.advancedTools.localizationApi)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.advancedTools.trackChanges)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.administration.roles)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.administration.offlineOperations)).toEqual({
      moduleCode: 'platform',
      submoduleCode: 'tenant-administration',
    });
    expect(requiredModuleForPath(ROUTES.basicData.countries)).toEqual({ moduleCode: 'reference-data', submoduleCode: 'geography' });
    expect(requiredModuleForPath(ROUTES.basicData.addressTypes)).toEqual({ moduleCode: 'reference-data', submoduleCode: 'addresses' });
    expect(requiredModuleForPath(ROUTES.basicData.companyGeographicScope)).toEqual({ moduleCode: 'platform', submoduleCode: 'tenant-administration' });
    expect(requiredModuleForPath(ROUTES.extras.appointments)).toEqual({ moduleCode: 'crm', submoduleCode: 'appointments' });
    expect(requiredModuleForPath(ROUTES.advancedTools.healthCheck)).toEqual({ moduleCode: 'platform', submoduleCode: 'operations' });
    expect(requiredModuleForPath(ROUTES.finance.ledgerSetup.currencies)).toEqual({ moduleCode: 'acc', submoduleCode: 'ledger-setup' });
  });

  it('defaults unknown routes to denied', () => {
    expect(canAccessRoute('/not-registered', userWith())).toBe(false);
  });

  it('uses the specific role-permissions policy before administration root', () => {
    const session = userWith({ permissionClaims: [permissions.ViewRolePermissions] });

    expect(getRoutePolicy('/administration/role-permissions/role-1')?.path)
      .toBe(ROUTES.administration.rolePermissionsRoot);
    expect(canAccessRoute('/administration/role-permissions/role-1', session)).toBe(true);
  });

  it('keeps Offline Operations behind its canonical view permission', () => {
    const usersViewer = userWith({ permissionClaims: [permissions.ViewUsers] });
    const rolesViewer = userWith({ permissionClaims: [permissions.ViewRoles] });
    const manager = userWith({ permissionClaims: [permissions.ViewOfflineOperations] });
    const roleOnlyAdmin = userWith({ roles: [appRoles.admin] });

    expect(getRoutePolicy(ROUTES.administration.offlineOperations)?.path)
      .toBe(ROUTES.administration.offlineOperations);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, usersViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, rolesViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, roleOnlyAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.administration.offlineOperations, manager)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.root, manager)).toBe(true);
  });

  it('reserves the global Countries catalog for super administrators', () => {
    expect(canAccessRoute(ROUTES.basicData.countries, userWith({
      roles: [appRoles.superAdmin],
    }))).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.countries, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.countries, userWith({
      permissionClaims: [permissions.ViewStates],
    }))).toBe(false);
  });

  it('keeps managed report access independent from Countries view access', () => {
    const countriesOnly = userWith({ permissionClaims: [permissions.ViewCountries] });
    const reportViewer = userWith({
      permissionClaims: [permissions.ViewCountries, permissions.ViewCrystalReports],
    });

    expect(getAuthorizationState(countriesOnly, false, {
      permissions: [permissions.ViewCrystalReports],
    })).toBe('forbidden');
    expect(getAuthorizationState(reportViewer, false, {
      permissions: [permissions.ViewCrystalReports],
    })).toBe('authorized');
  });

  it('reserves States and Districts catalog routes for super administrators', () => {
    const superAdmin = userWith({ roles: [appRoles.superAdmin] });

    expect(canAccessRoute(ROUTES.basicData.states, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.districts, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.states, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.states, userWith({ permissionClaims: [permissions.ViewCountries] }))).toBe(false);
  });

  it('allows tenant administrators to use operating countries but not the global catalog', () => {
    const tenantAdmin = userWith({
      roles: [appRoles.admin],
      permissionClaims: [
        permissions.ViewCompanyGeographicScope,
        permissions.EditCompanyGeographicScope,
        permissions.ViewCountries,
        permissions.ViewStates,
        permissions.ViewDistricts,
      ],
    });

    expect(canAccessRoute(ROUTES.basicData.companyGeographicScope, tenantAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.organizationalStructure, tenantAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.organizationalStructureManagement, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.countries, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.states, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.districts, tenantAdmin)).toBe(false);
  });

  it('requires the organizational structure view permission for its management route', () => {
    expect(canAccessRoute(
      ROUTES.basicData.organizationalStructureManagement,
      userWith({ permissionClaims: [permissions.ViewOrganizationalStructure] }),
    )).toBe(true);
    expect(canAccessRoute(
      ROUTES.basicData.organizationalStructureManagement,
      userWith({ permissionClaims: [permissions.ViewCompanyGeographicScope] }),
    )).toBe(false);
  });

  it('allows only the global geography branch of Basic Data for super administrators', () => {
    const superAdmin = userWith({ roles: [appRoles.superAdmin] });

    expect(canAccessRoute(ROUTES.basicData.root, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.geographicalInformation, superAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.organizationalStructure, superAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.addressTypes, userWith({
      roles: [appRoles.superAdmin],
      permissionClaims: [permissions.ViewAddressTypes],
    }))).toBe(false);
  });

  it('keeps super administrators outside tenant-owned modules', () => {
    const session = userWith({
      roles: [appRoles.superAdmin],
      permissionClaims: [permissions.ViewRoles],
    });

    expect(canAccessRoute(ROUTES.tenantManagement, session)).toBe(true);
    expect(canAccessRoute(ROUTES.administration.roles, session)).toBe(false);
    expect(canAccessRoute(ROUTES.apps, session)).toBe(false);
  });

  it('gives every drawer destination a registered policy', () => {
    for (const definition of MAIN_DRAWER_ROUTES) {
      expect(getRoutePolicy(definition.path)).toBeDefined();
    }
  });

  it('opens Finance for either implemented Accounting submodule and isolates leaf permissions', () => {
    const fiscalYearViewer = userWith({
      permissionClaims: [permissions.ViewFiscalYears],
    });
    const currencyViewer = userWith({
      permissionClaims: [permissions.ViewCurrencies],
    });

    expect(canAccessRoute(ROUTES.finance.root, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.fiscalYears, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.currencies, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.finance.root, fiscalYearViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.fiscalYears, fiscalYearViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.currencies, fiscalYearViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.finance.root, currencyViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.currencies, currencyViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.finance.ledgerSetup.fiscalYears, currencyViewer)).toBe(false);
  });

  it('allows the Workforce Planning workspace for any module view permission', () => {
    const staffingViewer = userWith({
      permissionClaims: [permissions.ViewStaffingRequests],
    });

    expect(canAccessRoute(ROUTES.workforcePlanning.index, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.workforcePlanning.index, staffingViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.workforcePlanning.staffingRequests, staffingViewer)).toBe(true);
  });

  it('keeps Workforce Planning leaf permissions isolated', () => {
    const planViewer = userWith({
      permissionClaims: [permissions.ViewWorkforcePlans],
    });

    expect(canAccessRoute(ROUTES.workforcePlanning.plans, planViewer)).toBe(true);
    expect(canAccessRoute(ROUTES.workforcePlanning.budgets, planViewer)).toBe(false);
    expect(canAccessRoute(ROUTES.workforcePlanning.trace, planViewer)).toBe(false);
  });

  it('registers Workforce Planning as a standalone drawer module', () => {
    const workforceRoute = MAIN_DRAWER_ROUTES.find(
      (definition) => definition.name === 'workforce-planning',
    );

    expect(workforceRoute?.path).toBe(ROUTES.workforcePlanning.index);
    expect(workforceRoute?.headerShown).toBe(false);
  });
});
