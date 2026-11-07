import { computed, inject, Injectable } from '@angular/core';
import { LocalizationRuntime } from '../../../localization/public-api';
import type { FieldMessages } from '../../../../shared/ui/public-api';
import type { TenantMutationField } from '../validation/tenant-mutation';

const labels: Readonly<Record<TenantMutationField, string>> = {
  identifier: 'identifier',
  name: 'name',
  isActive: 'tenantEnabled',
  subscriptionStatus: 'status',
  subscriptionStartedOn: 'startsOn',
  subscriptionEndsOn: 'endsOn',
  planName: 'plan',
  maxAdmins: 'maxAdmins',
  maxUsers: 'maxUsers',
  billingEmail: 'billingEmail',
  contactName: 'contactName',
  contactPhone: 'contactPhone',
  notes: 'notes',
  entitlements: 'entitlements',
};

/** Domain captions only; field lifecycle, error chrome and focus stay in the shared form owner. */
@Injectable()
export class TenantFormPresentation {
  readonly locale = inject(LocalizationRuntime);
  text(key: string): string {
    return this.locale.translate('tenantManagement.' + key, 'platform-tenants');
  }
  label(field: TenantMutationField): string {
    return this.text(labels[field]);
  }
  readonly messages = computed<FieldMessages>(() => ({
    required: this.locale.translate('validation.required'),
    maxlength: (details) =>
      this.locale.translate('validation.maxLength', 'core', { count: this.maximum(details) }),
    text: this.locale.translate('validation.invalidText'),
    invalidText: this.locale.translate('validation.invalidText'),
    identifier: this.text('validation.invalidIdentifier'),
    option: this.text('validation.invalidOption'),
    email: this.locale.translate('validation.email'),
    date: this.text('validation.invalidDate'),
    dateOrder: this.text('validation.endDateBeforeStart'),
    integer: this.locale.translate(
      'tenantManagement.validation.wholeNumberMin',
      'platform-tenants',
      { minimum: 1 },
    ),
    seatRange: this.text('seatRange'),
    usageLimit: this.text('seatLimitBelowUsage'),
    catalogCompatibility: this.text('catalogCompatibility'),
  }));
  private maximum(details: unknown): number {
    return typeof details === 'object' &&
      details !== null &&
      'requiredLength' in details &&
      typeof details.requiredLength === 'number'
      ? details.requiredLength
      : 0;
  }
}
