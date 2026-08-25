import { describe, expect, it } from '@jest/globals';

import { ROUTES } from '@/src/core/constants/routes';
import { getAuthorizationState, type AuthorizationClaims } from '../authorization';
import { permissions } from '../permissions';
import { canAccessRoute, getRoutePolicy } from '../route-access';
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
  it('defaults unknown routes to denied', () => {
    expect(canAccessRoute('/not-registered', userWith())).toBe(false);
  });

  it('uses the specific role-permissions policy before administration root', () => {
    const session = userWith({ permissionClaims: [permissions.ViewRoles] });

    expect(getRoutePolicy('/administration/role-permissions/role-1')?.path)
      .toBe(ROUTES.administration.rolePermissionsRoot);
    expect(canAccessRoute('/administration/role-permissions/role-1', session)).toBe(true);
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
        permissions.ManageCompanyGeographicScope,
        permissions.ViewCountries,
        permissions.ViewStates,
        permissions.ViewDistricts,
      ],
    });

    expect(canAccessRoute(ROUTES.basicData.companyGeographicScope, tenantAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.organizationalStructure, tenantAdmin)).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.countries, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.states, tenantAdmin)).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.districts, tenantAdmin)).toBe(false);
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
  });

  it('gives every drawer destination a registered policy', () => {
    for (const definition of MAIN_DRAWER_ROUTES) {
      expect(getRoutePolicy(definition.path)).toBeDefined();
    }
  });
});
