import { describe, expect, it } from '@jest/globals';

import { ROUTES } from '@/src/core/constants/routes';
import type { AuthorizationClaims } from '../authorization';
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

  it('protects the countries route with the countries view permission', () => {
    expect(canAccessRoute(ROUTES.basicData.countries, userWith({
      permissionClaims: [permissions.ViewCountries],
    }))).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.countries, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.countries, userWith({
      permissionClaims: [permissions.ViewStates],
    }))).toBe(false);
  });

  it('protects the States route with the States view permission', () => {
    expect(canAccessRoute(ROUTES.basicData.states, userWith({ permissionClaims: [permissions.ViewStates] }))).toBe(true);
    expect(canAccessRoute(ROUTES.basicData.states, userWith())).toBe(false);
    expect(canAccessRoute(ROUTES.basicData.states, userWith({ permissionClaims: [permissions.ViewCountries] }))).toBe(false);
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
