import { inject, Injectable } from '@angular/core';
import { LocalizationRuntime } from '../../localization/public-api';
import type { AuditAction } from '../types/audit-trail';

@Injectable()
export class AuditPresentation {
  readonly locale = inject(LocalizationRuntime);
  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('platform-advanced-tools');
  }
  text(key: string): string {
    return this.locale.translate('auditLog.' + key);
  }
  label(kind: 'modules' | 'entities' | 'fields', value: string): string {
    return this.locale.translate('auditLog.' + kind + '.' + value, 'core', {
      defaultValue: value
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .trim(),
    });
  }
  date(value: string): string {
    return new Intl.DateTimeFormat(this.locale.language() === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
  accent(action: AuditAction): string {
    return {
      Created: 'var(--success)',
      Modified: 'var(--info)',
      Deleted: 'var(--destructive)',
      Restored: 'var(--warning)',
    }[action];
  }
}
