import { Component, computed, inject, input } from '@angular/core';
import { StatusBadge } from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { statusAccent } from '../../../presentation/dashboard-utils';
import type { TenantRecord } from '../../types/tenant';

@Component({
  selector: 'erp-tenant-card-header',
  imports: [StatusBadge, UiTextPipe],
  templateUrl: './tenant-card-header.html',
  styleUrl: './tenant-card-header.scss',
})
export class TenantCardHeader {
  readonly tenant = input.required<TenantRecord>();
  private readonly locale = inject(LocalizationRuntime);
  readonly status = computed(() =>
    this.locale.translate(
      'tenantManagement.statuses.' + this.tenant().subscriptionStatus,
      'platform-tenants',
    ),
  );
  readonly accent = computed(() => statusAccent(this.tenant().subscriptionStatus));
}
