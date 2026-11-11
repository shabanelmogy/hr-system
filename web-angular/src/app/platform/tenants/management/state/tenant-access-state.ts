import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, Subject, take, takeUntil, throwIfEmpty } from 'rxjs';
import { AuthSession, type Session } from '../../../auth/session.public-api';
import { CommandFailure, UnsavedChanges } from '../../../../shared/data/public-api';
import { FeedbackNotifications } from '../../../../shared/ui/feedback/notifications.public-api';
import { TenantManagementService } from '../services/tenant-management-service';
import { tenantReadAllowed, type TenantRecord } from '../types/tenant';
import type { TenantMutation } from '../validation/tenant-mutation';
import { TenantReadState } from './tenant-read-state';

interface AccessRequest {
  readonly actor: Session;
  readonly row: TenantRecord;
  readonly enabled: boolean;
  readonly serial: number;
}

/** Confirms one explicit access target and preserves the freshly read Tenant aggregate. */
@Injectable()
export class TenantAccessState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(TenantManagementService);
  private readonly reads = inject(TenantReadState);
  private readonly drafts = inject(UnsavedChanges);
  private readonly notices = inject(FeedbackNotifications);
  private readonly destroy = inject(DestroyRef);
  private readonly context = signal<AccessRequest | null>(null);
  private readonly denied = signal<Session | null>(null);
  private readonly cancelled = new Subject<void>();
  private serial = 0;
  readonly pending = signal(false);
  readonly blocked = signal(false);
  readonly feedback = signal('');
  readonly canWrite = computed(() => {
    const actor = this.auth.readIdentity();
    return (
      !!actor &&
      tenantReadAllowed(actor) &&
      !actor.tenantReadOnly &&
      actor !== this.denied() &&
      this.reads.source().kind !== 'forbidden'
    );
  });
  readonly active = computed(() => {
    const entry = this.context();
    return (
      !!entry &&
      entry.actor === this.auth.readIdentity() &&
      tenantReadAllowed(entry.actor) &&
      !entry.actor.tenantReadOnly
    );
  });
  readonly record = computed(() => (this.active() ? (this.context()?.row ?? null) : null));
  readonly enabling = computed(() => this.context()?.enabled ?? false);

  constructor() {
    const unregister = this.drafts.register({
      read: () => ({
        identity: 'tenant-access:' + (this.context()?.serial ?? 0),
        revision: 0,
        active: this.active(),
        pending: this.pending(),
        unsaved: false,
      }),
      invalidate: () => this.invalidate(),
    });
    effect(() => {
      const actor = this.auth.readIdentity();
      untracked(() => {
        if (
          this.context()?.actor !== actor ||
          !actor ||
          !tenantReadAllowed(actor) ||
          actor.tenantReadOnly
        )
          this.invalidate();
      });
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.invalidate();
      this.cancelled.complete();
    });
  }

  request(row: TenantRecord): void {
    const actor = this.auth.readIdentity();
    const source = this.reads.source();
    const current =
      source.kind === 'ready'
        ? source.result?.rows.find((candidate) => candidate.id === row.id)
        : null;
    if (
      !actor ||
      !this.canWrite() ||
      this.active() ||
      this.drafts.requiresDecision() ||
      !current ||
      current.lifecycleStatus !== 'active' ||
      current.rowVersion !== row.rowVersion ||
      current.isActive !== row.isActive
    )
      return;
    this.context.set({ actor, row: current, enabled: !current.isActive, serial: ++this.serial });
    this.feedback.set('');
    this.blocked.set(false);
  }

  async confirm(): Promise<void> {
    const entry = this.context();
    if (!entry || !this.current(entry) || !this.canWrite() || this.pending() || this.blocked())
      return;
    this.pending.set(true);
    this.feedback.set('');
    let writing = false;
    try {
      const tenant = await firstValueFrom(
        this.service.detail(entry.row.id).pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(entry) || !this.canWrite()) return;
      if (tenant.lifecycleStatus !== 'active') {
        this.blocked.set(true);
        this.feedback.set('tenantManagement.archivedRequiresRestore');
        return;
      }
      if (tenant.isActive !== entry.enabled) {
        writing = true;
        const result = await firstValueFrom(
          this.service
            .update(tenant.id, accessMutation(tenant, entry.enabled), tenant.rowVersion)
            .pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
        );
        if (result.isActive !== entry.enabled) throw new CommandFailure('uncertain', null);
      }
      if (!this.current(entry)) return;
      this.invalidate();
      this.notices.success(
        entry.enabled ? 'tenantManagement.accessEnabled' : 'tenantManagement.accessDisabled',
        'platform-tenants',
      );
      this.reads.refresh();
    } catch (error: unknown) {
      if (!this.current(entry)) return;
      const failure = error instanceof CommandFailure ? error : null;
      const status = failure?.status ?? (error instanceof HttpErrorResponse ? error.status : null);
      const denied = status === 401 || status === 403;
      const uncertain = writing && (!failure || failure.outcome === 'uncertain');
      const conflict =
        failure?.codes.some(
          (code) =>
            code === 'Tenant.ConcurrencyConflict' || code === 'Tenant.ConcurrencyTokenRequired',
        ) ?? false;
      this.blocked.set(uncertain || conflict || denied);
      if (denied) this.denied.set(entry.actor);
      this.feedback.set(
        denied
          ? 'authorization.forbidden.title'
          : uncertain
            ? 'tenantManagement.mutationUncertain'
            : conflict
              ? 'tenantManagement.concurrencyConflict'
              : 'tenantManagement.accessError',
      );
    } finally {
      if (this.context() === entry) this.pending.set(false);
    }
  }

  close(): void {
    if (this.pending()) return;
    const refresh = this.blocked();
    this.invalidate();
    if (refresh) this.reads.refresh();
  }

  private current(entry: AccessRequest): boolean {
    return !this.destroy.destroyed && this.context() === entry && this.active();
  }

  private invalidate(): void {
    this.cancelled.next();
    this.context.set(null);
    this.pending.set(false);
    this.blocked.set(false);
    this.feedback.set('');
  }
}

function accessMutation(tenant: TenantRecord, enabled: boolean): TenantMutation {
  return {
    identifier: tenant.identifier,
    name: tenant.name,
    isActive: enabled,
    subscriptionStatus: tenant.subscriptionStatus,
    subscriptionStartedOn: tenant.subscriptionStartedOn,
    subscriptionEndsOn: tenant.subscriptionEndsOn,
    planName: tenant.planName,
    maxAdmins: tenant.maxAdmins,
    maxUsers: tenant.maxUsers,
    billingEmail: tenant.billingEmail,
    contactName: tenant.contactName,
    contactPhone: tenant.contactPhone,
    notes: tenant.notes,
    // The existing update API treats null as "retain saved entitlements".
    entitlements: null,
  };
}
