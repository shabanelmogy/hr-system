import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../auth/session.public-api';
import { tenantAdminAllowed } from './types/tenant-admin';
export const tenantAdminsGuard: CanActivateFn = () =>
  tenantAdminAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');
