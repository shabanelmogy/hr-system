import { InjectionToken, type TemplateRef, type Type } from '@angular/core';
import type { Session } from '../auth/session.public-api';

export interface SystemErrorLogReportAdapter {
  readonly component: Type<unknown>;
  readonly headerActions?: (component: unknown) => TemplateRef<unknown> | null;
  allowed(actor: Session | null): boolean;
}

/** Composition connects Reporting; Platform never imports a business module. */
export const SYSTEM_ERROR_LOG_REPORT = new InjectionToken<SystemErrorLogReportAdapter | null>(
  'platform.system-error-log-report',
  { factory: () => null },
);
