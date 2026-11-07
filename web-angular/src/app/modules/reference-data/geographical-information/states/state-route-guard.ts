import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { stateReadAllowed } from './types/state';
export const stateRouteGuard: CanActivateFn = () =>
  stateReadAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');
