import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { districtReadAllowed } from './types/district';
export const districtRouteGuard: CanActivateFn = () =>
  districtReadAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');
