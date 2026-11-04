import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthSession } from '../../../platform/auth/session.public-api';
import { globalReportAllowed, globalReportEntities } from './types/global-report';

export function globalReportConsumerAllowed(
  actor: Parameters<typeof globalReportAllowed>[0],
): boolean {
  return globalReportEntities.some((entity) => globalReportAllowed(actor, entity));
}
export const globalReportConsumerGuard: CanActivateFn = () =>
  globalReportConsumerAllowed(inject(AuthSession).readIdentity()) ||
  inject(Router).parseUrl('/home');
