import { computed, inject, Injectable } from '@angular/core';
import { AuthSession } from '../../../auth/session.public-api';
import { TenantEntitlementCatalogService } from '../../../modules/entitlements.public-api';
import { createScopedRead } from '../../../../shared/data/public-api';
import { tenantReadAllowed } from '../types/tenant';

/** Assignable commercial modules are independent from the current user's navigation catalog. */
@Injectable()
export class TenantEntitlementsState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(TenantEntitlementCatalogService);
  private readonly actor = computed(() => this.auth.readIdentity());
  private readonly read = createScopedRead(this.actor, tenantReadAllowed, () =>
    this.service.lookup(),
  );
  readonly view = this.read.state;
  readonly pending = this.read.pending;
  readonly modules = computed(() => {
    const view = this.view();
    return view.kind === 'ready' ? view.data : [];
  });
  readonly ready = computed(() => this.view().kind === 'ready');
  refresh(): void {
    this.read.refresh();
  }
}
