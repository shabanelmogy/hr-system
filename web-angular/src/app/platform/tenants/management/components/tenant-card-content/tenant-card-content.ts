import { Component, computed, inject, input } from '@angular/core';
import { MetricCard } from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import type { TenantRecord } from '../../types/tenant';

@Component({
  selector: 'erp-tenant-card-content',
  imports: [MetricCard, UiTextPipe],
  templateUrl: './tenant-card-content.html',
  styleUrl: './tenant-card-content.scss',
})
export class TenantCardContent {
  readonly tenant = input.required<TenantRecord>();
  readonly locale = inject(LocalizationRuntime);
  readonly metrics = computed(() => {
    const row = this.tenant();
    const number = new Intl.NumberFormat(this.locale.language());
    return [
      {
        id: 'admins',
        value: number.format(row.adminCount) + '/' + number.format(row.maxAdmins),
        icon: 'admin' as const,
      },
      {
        id: 'users',
        value: number.format(row.userCount) + '/' + number.format(row.maxUsers),
        icon: 'user' as const,
      },
      { id: 'companies', value: number.format(row.companyCount), icon: 'company' as const },
      { id: 'totalAccounts', value: number.format(row.totalUserCount), icon: 'groups' as const },
    ];
  });
  date(value: string): string {
    return new Intl.DateTimeFormat(this.locale.language(), { dateStyle: 'medium' }).format(
      new Date(value),
    );
  }
}
