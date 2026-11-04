import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../../../platform/auth/session.public-api';
import { globalTemplateManagerAllowed } from './types/global-template';

export const globalTemplateManagerGuard: CanActivateFn = () =>
  globalTemplateManagerAllowed(inject(AuthSession).readIdentity()) ||
  inject(Router).parseUrl('/home');
