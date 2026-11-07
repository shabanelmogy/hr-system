import { InjectionToken, type Type } from '@angular/core';
import type { Session } from '../auth/session.public-api';

export interface SystemErrorLogReportAdapter {
  readonly component: Type<unknown>;
  allowed(actor: Session | null): boolean;
}

/** Composition connects Reporting; Platform never imports a business module. */
export const SYSTEM_ERROR_LOG_REPORT = new InjectionToken<SystemErrorLogReportAdapter | null>(
  'platform.system-error-log-report',
  { factory: () => null },
);
