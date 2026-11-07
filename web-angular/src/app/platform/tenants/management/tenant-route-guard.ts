import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../../auth/session.public-api';
import { tenantReadAllowed } from './types/tenant';

export const tenantRouteGuard: CanActivateFn = () =>
  tenantReadAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');

export const tenantCreateRouteGuard: CanActivateFn = () => {
  const user = inject(AuthSession).readIdentity();
  const router = inject(Router);
  return tenantReadAllowed(user)
    ? user?.tenantReadOnly
      ? router.parseUrl('/super-admin/tenants')
      : true
    : router.parseUrl('/home');
};
