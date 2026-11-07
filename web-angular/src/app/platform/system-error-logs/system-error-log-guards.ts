import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../auth/session.public-api';
import { errorLogSettingsAllowed, systemErrorLogsAllowed } from './system-error-log-access';

export const systemErrorLogsGuard: CanActivateFn = () =>
  systemErrorLogsAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');
export const errorLogSettingsGuard: CanActivateFn = () =>
  errorLogSettingsAllowed(inject(AuthSession).readIdentity()) || inject(Router).parseUrl('/home');
