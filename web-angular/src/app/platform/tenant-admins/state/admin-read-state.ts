import { computed, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { createScopedRead } from '../../../shared/data/public-api';
import type { CollectionSource } from '../../../shared/ui/public-api';
import {
  localTabularSource,
  type TabularColumn,
  type TabularExportSource,
} from '../../../shared/data/public-api';
import { TenantAdminService } from '../services/tenant-admin-service';
import { tenantAdminAllowed, type TenantAdmin } from '../types/tenant-admin';
@Injectable()
export class AdminReadState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(TenantAdminService);
  private readonly read = createScopedRead(this.auth.readIdentity, tenantAdminAllowed, () =>
    this.service.all(),
  );
  private readonly actors = new WeakMap<Session, number>();
  private sequence = 0;
  readonly view = this.read.state;
  exportSource(
    columns: readonly TabularColumn<TenantAdmin>[],
    culture: 'en' | 'ar',
  ): TabularExportSource | null {
    const actor = this.auth.readIdentity(),
      view = this.view();
    if (!actor || !tenantAdminAllowed(actor) || view.kind !== 'ready') return null;
    return localTabularSource({
      actor,
      criteriaKey: 'tenant-admins:all',
      fileName: 'tenant-admins',
      culture,
      columns,
      rows: view.data,
      isCurrent: () => this.auth.readIdentity() === actor && this.view().kind === 'ready',
    });
  }
  readonly pending = this.read.pending;
  private readonly requestedRefresh = signal<Session | null>(null);
  readonly source = computed<CollectionSource<TenantAdmin>>(() => {
    const actor = this.auth.readIdentity(),
      view = this.view();
    if (actor && !this.actors.has(actor)) this.actors.set(actor, ++this.sequence);
    const query = {
      scopeKey: 'tenant-admins:' + (actor ? this.actors.get(actor) : 'anonymous'),
      criteriaKey: 'all',
      pageIndex: 0,
      pageSize: view.kind === 'ready' ? Math.max(1, view.data.length) : 1,
    };
    return view.kind === 'ready'
      ? {
          query,
          kind: 'ready',
          result: { query, rows: view.data, total: view.data.length, hasNextPage: false },
        }
      : { query, kind: view.kind };
  });
  constructor() {
    effect(() => {
      const actor = this.requestedRefresh();
      if (!actor) return;
      if (actor !== this.auth.readIdentity()) {
        this.requestedRefresh.set(null);
        return;
      }
      const view = this.view();
      if (!this.pending() && (view.kind === 'ready' || view.kind === 'error')) {
        this.requestedRefresh.set(null);
        untracked(() => this.read.refreshInBackground());
      }
    });
  }
  refresh(): void {
    const actor = this.auth.readIdentity();
    if (tenantAdminAllowed(actor)) this.requestedRefresh.set(actor);
  }
}
