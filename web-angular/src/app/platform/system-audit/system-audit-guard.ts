import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../auth/session.public-api';
import { systemAuditAllowed } from './system-audit-access';
export const systemAuditGuard: CanActivateFn = () =>
  systemAuditAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');
