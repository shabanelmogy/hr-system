import { computed, inject, Injectable } from '@angular/core';
import { LocalizationRuntime } from '../../localization/public-api';
import type { FieldMessages } from '../../../shared/ui/public-api';
@Injectable()
export class AdminFormPresentation {
  readonly locale = inject(LocalizationRuntime);
  readonly messages = computed<FieldMessages>(() => ({
    required: this.locale.translate('validation.required'),
    maxLength: this.locale.translate('tenantAdmins.errors.tooLong', 'platform-tenants'),
    email: this.text('errors.invalidEmail'),
    passwordLength: this.text('errors.passwordLength'),
    invalidTenants: this.text('errors.invalidTenants'),
    invalidDefault: this.text('errors.invalidDefault'),
  }));
  text(key: string): string {
    return this.locale.translate('tenantAdmins.' + key, 'platform-tenants');
  }
}
