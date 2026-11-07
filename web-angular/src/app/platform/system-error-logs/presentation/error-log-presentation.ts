import { inject, Injectable } from '@angular/core';
import { LocalizationRuntime } from '../../localization/public-api';
@Injectable()
export class ErrorLogPresentation {
  readonly locale = inject(LocalizationRuntime);
  constructor() {
    void this.locale.loadNamespace('core');
    void this.locale.loadNamespace('platform-advanced-tools');
  }
  text(key: string): string {
    return this.locale.translate('errorLogs.' + key, 'platform-advanced-tools');
  }
  systemTitle(): string {
    return this.locale.translate('systemErrorLogs.title', 'platform-advanced-tools');
  }
  settingsText(key: string): string {
    return this.locale.translate('errorLogSettings.' + key, 'platform-advanced-tools');
  }
  core(key: string): string {
    return this.locale.translate(key, 'core');
  }
  date(value: string): string {
    return new Intl.DateTimeFormat(this.locale.language() === 'ar' ? 'ar-EG' : 'en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
  numeric(value: number | null): string {
    return value === null
      ? this.text('notAvailable')
      : new Intl.NumberFormat(this.locale.language() === 'ar' ? 'ar-EG' : 'en-US').format(value);
  }
}
