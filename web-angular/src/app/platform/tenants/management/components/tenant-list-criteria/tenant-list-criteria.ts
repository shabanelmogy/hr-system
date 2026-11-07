import { Component, computed, inject } from '@angular/core';
import {
  ActionButton,
  OptionSelect,
  SortDirectionButton,
} from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../localization/public-api';
import { TenantReadState } from '../../state/tenant-read-state';
import { tenantSortColumns } from '../../types/tenant';

@Component({
  selector: 'erp-tenant-list-criteria',
  imports: [ActionButton, OptionSelect, SortDirectionButton, UiTextPipe],
  templateUrl: './tenant-list-criteria.html',
  styleUrl: './tenant-list-criteria.scss',
})
export class TenantListCriteria {
  readonly reads = inject(TenantReadState);
  readonly locale = inject(LocalizationRuntime);
  readonly sorts = computed(() =>
    tenantSortColumns.map((value) => ({
      value,
      label:
        value === 'createdOn'
          ? this.locale.translate('general.createdOn')
          : this.locale.translate('tenantManagement.' + value, 'platform-tenants'),
    })),
  );
  choose(value: string): void {
    if (tenantSortColumns.some((column) => column === value))
      this.reads.changeSort({
        field: value,
        direction: this.reads.query().sortDirection === 'DESC' ? 'desc' : 'asc',
      });
  }
}
