import { computed, inject, Injectable } from '@angular/core';
import { AuthSession } from '../../auth/session.public-api';
import { TenantManagementService } from '../../tenants/management/lookup.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import { tenantAdminAllowed } from '../types/tenant-admin';
@Injectable()
export class AdminTenantChoices {
  private readonly service = inject(TenantManagementService);
  private readonly read = createScopedRead(
    inject(AuthSession).readIdentity,
    tenantAdminAllowed,
    () => this.service.all(),
  );
  readonly view = this.read.state;
  readonly pending = this.read.pending;
  readonly ready = computed(() => this.view().kind === 'ready');
  readonly tenants = computed(() => {
    const view = this.view();
    return view.kind === 'ready' ? view.data : [];
  });
  refresh(): void {
    this.read.refresh();
  }
}
