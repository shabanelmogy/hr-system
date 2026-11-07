import { computed, inject, Injectable } from '@angular/core';
import { LocalizationRuntime } from '../../localization/public-api';
import type { FieldMessages } from '../../../shared/ui/public-api';

@Injectable()
export class RetentionPresentation {
  readonly locale = inject(LocalizationRuntime);
  text(key: string): string {
    return this.locale.translate('errorLogSettings.' + key, 'platform-advanced-tools');
  }
  readonly messages = computed<FieldMessages>(() => ({
    required: this.text('required'),
    range: this.text('range'),
  }));
  numeric(value: number): string {
    return new Intl.NumberFormat(this.locale.language()).format(value);
  }
}
