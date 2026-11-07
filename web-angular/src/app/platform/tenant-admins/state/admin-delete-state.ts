import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { firstValueFrom, Subject, take, takeUntil, throwIfEmpty } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { CommandFailure, UnsavedChanges } from '../../../shared/data/public-api';
import { TenantAdminService } from '../services/tenant-admin-service';
import { tenantAdminAllowed, type TenantAdmin } from '../types/tenant-admin';
import { AdminReadState } from './admin-read-state';
interface DeleteEntry {
  readonly actor: Session;
  readonly row: TenantAdmin;
  readonly serial: number;
}
@Injectable()
export class AdminDeleteState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(TenantAdminService);
  private readonly reads = inject(AdminReadState);
  private readonly drafts = inject(UnsavedChanges);
  private readonly destroy = inject(DestroyRef);
  private readonly context = signal<DeleteEntry | null>(null);
  private readonly cancelled = new Subject<void>();
  private readonly denied = signal<Session | null>(null);
  private readonly accepted = new Subject<void>();
  private serial = 0;
  readonly completed = this.accepted.asObservable();
  readonly pending = signal(false);
  readonly uncertain = signal(false);
  readonly feedback = signal('');
  readonly canWrite = computed(() => {
    const actor = this.auth.readIdentity();
    return (
      tenantAdminAllowed(actor) &&
      !!actor &&
      !actor.tenantReadOnly &&
      actor !== this.denied() &&
      this.reads.view().kind !== 'forbidden'
    );
  });
  readonly active = computed(() => {
    const entry = this.context();
    return (
      !!entry &&
      entry.actor === this.auth.readIdentity() &&
      tenantAdminAllowed(entry.actor) &&
      !entry.actor.tenantReadOnly
    );
  });
  readonly record = computed(() => (this.active() ? (this.context()?.row ?? null) : null));
  constructor() {
    const unregister = this.drafts.register({
      read: () => ({
        identity: 'tenant-admin-delete:' + (this.context()?.serial ?? 0),
        revision: 0,
        active: this.active() && (this.pending() || this.uncertain()),
        pending: this.pending(),
        unsaved: this.uncertain(),
      }),
      invalidate: () => this.invalidate(),
    });
    effect(() => {
      const entry = this.context();
      if (
        entry &&
        (entry.actor !== this.auth.readIdentity() ||
          entry.actor.tenantReadOnly ||
          !tenantAdminAllowed(entry.actor))
      )
        untracked(() => this.invalidate());
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.invalidate();
      this.cancelled.complete();
      this.accepted.complete();
    });
  }
  request(row: TenantAdmin): void {
    const actor = this.auth.readIdentity(),
      view = this.reads.view();
    if (
      !actor ||
      !this.canWrite() ||
      this.active() ||
      this.drafts.busy() ||
      view.kind !== 'ready' ||
      !view.data.some((entry) => entry.id === row.id && entry.lifecycleStatus === 'active')
    )
      return;
    this.context.set({ actor, row, serial: ++this.serial });
    this.feedback.set('');
    this.uncertain.set(false);
  }
  async confirm(): Promise<void> {
    const entry = this.context();
    if (!entry || !this.active() || !this.canWrite() || this.pending() || this.uncertain()) return;
    this.pending.set(true);
    this.feedback.set('');
    try {
      await firstValueFrom(
        this.service.archive(entry.row.id).pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (this.context() !== entry || !this.active()) return;
      this.invalidate();
      this.reads.refresh();
      this.accepted.next();
    } catch (error: unknown) {
      if (this.context() !== entry || !this.active()) return;
      const failure =
        error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
      this.uncertain.set(failure.outcome === 'uncertain');
      if (failure.status === 401 || failure.status === 403) {
        this.denied.set(entry.actor);
        this.feedback.set('authorization.forbidden.title');
      } else
        this.feedback.set(
          this.uncertain()
            ? 'tenantAdmins.errors.uncertainDelete'
            : failure.codes.includes('TenantAdmin.NotFound')
              ? 'tenantAdmins.errors.notFound'
              : 'tenantAdmins.errors.delete',
        );
    } finally {
      if (this.context() === entry) this.pending.set(false);
    }
  }
  close(): void {
    if (this.pending()) return;
    const refresh = this.uncertain();
    this.invalidate();
    if (refresh) this.reads.refresh();
  }
  private invalidate(): void {
    this.cancelled.next();
    this.context.set(null);
    this.pending.set(false);
    this.uncertain.set(false);
    this.feedback.set('');
  }
}
