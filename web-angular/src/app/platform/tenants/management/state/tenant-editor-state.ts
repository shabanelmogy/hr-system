import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { submit, type ValidationError } from '@angular/forms/signals';
import { HttpErrorResponse } from '@angular/common/http';
import { toObservable } from '@angular/core/rxjs-interop';
import {
  filter,
  firstValueFrom,
  Subject,
  take,
  takeUntil,
  throwIfEmpty,
  type Subscription,
} from 'rxjs';
import { AuthSession, type Session } from '../../../auth/session.public-api';
import { LocalizationRuntime } from '../../../localization/public-api';
import { CommandFailure, UnsavedChanges } from '../../../../shared/data/public-api';
import { mapServerFieldErrors, type CloseConsent } from '../../../../shared/ui/public-api';
import { TenantManagementService } from '../services/tenant-management-service';
import { tenantReadAllowed, type TenantRecord } from '../types/tenant';
import {
  createTenantForm,
  defaultTenantEntitlements,
  emptyTenantDraft,
  parseTenantMutation,
  tenantDraftKey,
  tenantSavedEntitlements,
  type TenantDraft,
} from '../validation/tenant-mutation';
import { TenantEntitlementsState } from './tenant-entitlements-state';
import { TenantReadState } from './tenant-read-state';

interface EditorContext {
  readonly actor: Session;
  readonly serial: number;
  readonly mode: 'create' | 'edit';
  readonly id: string | null;
}
export interface TenantSaved {
  readonly mode: 'create' | 'edit';
  readonly tenant: TenantRecord;
}

/** Owns the aggregate draft, fresh rowVersion and command acceptance for one open editor. */
@Injectable()
export class TenantEditorState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(TenantManagementService);
  private readonly reads = inject(TenantReadState, { optional: true });
  readonly catalog = inject(TenantEntitlementsState);
  private readonly catalogSnapshots = toObservable(this.catalog.view);
  private readonly drafts = inject(UnsavedChanges);
  private readonly locale = inject(LocalizationRuntime);
  private readonly destroy = inject(DestroyRef);
  private readonly context = signal<EditorContext | null>(null);
  private readonly loaded = signal<TenantRecord | null>(null);
  private readonly baseline = signal(tenantDraftKey(emptyTenantDraft));
  private readonly denied = signal<Session | null>(null);
  private readonly complete = new Subject<TenantSaved>();
  private readonly invalid = new Subject<void>();
  private readonly cancelled = new Subject<void>();
  private operation: Subscription | null = null;
  private serial = 0;
  readonly saved = this.complete.asObservable();
  readonly errorsChanged = this.invalid.asObservable();
  readonly form = createTenantForm(
    () => this.catalog.modules(),
    {
      submission: {
        ignoreValidators: 'none',
        action: () => this.persist(),
        onInvalid: () => this.invalid.next(),
      },
    },
    () => {
      const record = this.loaded();
      return record
        ? { currentAdminCount: record.adminCount, currentUserCount: record.userCount }
        : {};
    },
  );
  readonly revision = linkedSignal<TenantDraft, number>({
    source: () => this.form().value(),
    computation: (_value, previous) => (previous?.value ?? 0) + 1,
  });
  readonly pending = computed(() => this.form().submitting());
  readonly phase = signal<'loading' | 'ready' | 'error' | 'forbidden' | 'catalog-error'>('ready');
  readonly uncertain = signal(false);
  readonly conflict = signal(false);
  readonly feedback = signal('');
  readonly locked = computed(() => this.pending() || this.uncertain() || this.conflict());
  private allowed(actor: Session | null): actor is Session {
    return !!actor && tenantReadAllowed(actor) && !actor.tenantReadOnly;
  }
  readonly canCreate = computed(() => {
    const actor = this.auth.readIdentity();
    return (
      this.allowed(actor) &&
      actor !== this.denied() &&
      this.catalog.ready() &&
      this.reads?.source().kind !== 'forbidden'
    );
  });
  readonly active = computed(() => {
    const entry = this.context();
    return !!entry && entry.actor === this.auth.readIdentity() && this.allowed(entry.actor);
  });
  readonly mode = computed(() => this.context()?.mode ?? 'create');
  readonly identity = computed(() => 'tenant-editor:' + (this.context()?.serial ?? 0));
  readonly unsaved = computed(
    () => this.active() && tenantDraftKey(this.form().value()) !== this.baseline(),
  );

  constructor() {
    const unregister = this.drafts.register({
      read: () => ({
        identity: this.identity(),
        revision: this.revision(),
        active: this.active(),
        unsaved: this.unsaved(),
        pending: this.pending(),
      }),
      invalidate: () => this.invalidate(),
    });
    effect(() => {
      const entry = this.context();
      if (entry && (entry.actor !== this.auth.readIdentity() || !this.allowed(entry.actor)))
        untracked(() => this.invalidate());
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.invalidate();
      this.cancelled.complete();
      this.complete.complete();
      this.invalid.complete();
    });
  }
  create(): void {
    if (!this.canCreate() || this.active() || this.pending() || this.drafts.busy()) return;
    this.begin('create', null);
    this.reset({
      ...emptyTenantDraft,
      planName: 'Free',
      maxAdmins: '1',
      maxUsers: '5',
      subscriptionStartedOn: new Date().toISOString().slice(0, 10),
      entitlements: defaultTenantEntitlements(this.catalog.modules()),
    });
    this.phase.set('ready');
  }
  edit(id: string): void {
    if (!this.canCreate() || !id.trim() || this.active() || this.pending() || this.drafts.busy())
      return;
    this.load(this.begin('edit', id));
  }
  private begin(mode: EditorContext['mode'], id: string | null): EditorContext {
    const actor = this.auth.readIdentity();
    if (!this.allowed(actor)) throw Error('A writable global actor is required');
    const entry = { actor, serial: ++this.serial, mode, id };
    this.operation?.unsubscribe();
    this.loaded.set(null);
    this.context.set(entry);
    this.feedback.set('');
    this.conflict.set(false);
    this.uncertain.set(false);
    this.reset({ ...emptyTenantDraft });
    return entry;
  }
  private reset(draft: TenantDraft): void {
    this.form().reset(draft);
    this.baseline.set(tenantDraftKey(draft));
  }
  private current(entry: EditorContext): boolean {
    return !this.destroy.destroyed && this.context() === entry && this.active();
  }
  private load(entry: EditorContext): void {
    if (!this.current(entry) || entry.id === null) return;
    this.phase.set('loading');
    this.operation?.unsubscribe();
    this.operation = this.service
      .detail(entry.id)
      .pipe(take(1), throwIfEmpty())
      .subscribe({
        next: (tenant) => {
          if (!this.current(entry)) return;
          this.loaded.set(tenant);
          if (tenant.lifecycleStatus !== 'active') {
            this.phase.set('error');
            this.feedback.set('tenantManagement.archivedRequiresRestore');
            return;
          }
          if (!this.catalog.ready()) {
            this.phase.set('catalog-error');
            return;
          }
          try {
            const entitlements =
              tenant.entitlements == null
                ? defaultTenantEntitlements(this.catalog.modules())
                : tenantSavedEntitlements(tenant.entitlements, this.catalog.modules());
            this.reset({
              identifier: tenant.identifier,
              name: tenant.name,
              isActive: tenant.isActive,
              subscriptionStatus: tenant.subscriptionStatus,
              subscriptionStartedOn: tenant.subscriptionStartedOn.slice(0, 10),
              subscriptionEndsOn: tenant.subscriptionEndsOn?.slice(0, 10) ?? '',
              planName: tenant.planName ?? '',
              maxAdmins: String(tenant.maxAdmins),
              maxUsers: String(tenant.maxUsers),
              billingEmail: tenant.billingEmail ?? '',
              contactName: tenant.contactName ?? '',
              contactPhone: tenant.contactPhone ?? '',
              notes: tenant.notes ?? '',
              entitlements,
            });
            this.conflict.set(false);
            this.feedback.set('');
            this.phase.set('ready');
          } catch {
            this.phase.set('catalog-error');
            this.feedback.set('tenantManagement.catalogCompatibility');
          }
        },
        error: (error: unknown) => {
          if (!this.current(entry)) return;
          if (
            error instanceof HttpErrorResponse &&
            (error.status === 401 || error.status === 403)
          ) {
            this.denied.set(entry.actor);
            this.phase.set('forbidden');
          } else this.phase.set('error');
        },
      });
  }
  async reload(): Promise<void> {
    const entry = this.context();
    if (
      !entry ||
      !this.current(entry) ||
      entry.mode !== 'edit' ||
      this.pending() ||
      this.uncertain()
    )
      return;
    const stamp = this.drafts.stamp();
    if (
      !(await this.drafts.request('tenant-editor:reload')) ||
      !this.drafts.matches(stamp) ||
      !this.current(entry)
    )
      return;
    this.load(entry);
  }
  async retry(): Promise<void> {
    const entry = this.context();
    if (!entry || !this.current(entry) || this.locked()) return;
    if (this.phase() === 'catalog-error') {
      this.phase.set('loading');
      this.catalog.refresh();
      try {
        await firstValueFrom(
          this.catalogSnapshots.pipe(
            filter(() => !this.catalog.pending()),
            take(1),
            takeUntil(this.cancelled),
            throwIfEmpty(),
          ),
        );
      } catch {
        return;
      }
      if (!this.current(entry)) return;
      if (!this.catalog.ready()) {
        this.phase.set(this.catalog.view().kind === 'forbidden' ? 'forbidden' : 'catalog-error');
        return;
      }
    } else if (this.phase() !== 'error') return;
    this.load(entry);
  }
  save(): Promise<boolean> | false {
    const entry = this.context();
    return entry &&
      this.current(entry) &&
      !this.locked() &&
      this.phase() === 'ready' &&
      this.catalog.ready()
      ? submit(this.form)
      : false;
  }
  private async persist(): Promise<ValidationError.WithFieldTree[] | undefined> {
    const entry = this.context();
    if (
      !entry ||
      !this.current(entry) ||
      this.uncertain() ||
      this.conflict() ||
      !this.catalog.ready() ||
      this.phase() !== 'ready'
    )
      return [{ kind: 'unavailable', fieldTree: this.form }];
    const draft = this.form().value();
    const payload = parseTenantMutation(draft, this.catalog.modules());
    const record = this.loaded();
    if (
      entry.mode === 'edit' &&
      (!record || record.id !== entry.id || record.lifecycleStatus !== 'active')
    )
      return [{ kind: 'unavailable', fieldTree: this.form }];
    try {
      const request =
        entry.mode === 'create'
          ? this.service.create(payload)
          : record
            ? this.service.update(record.id, payload, record.rowVersion)
            : null;
      if (!request) return [{ kind: 'unavailable', fieldTree: this.form }];
      const tenant = await firstValueFrom(
        request.pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(entry)) return;
      this.invalidate();
      this.complete.next({ mode: entry.mode, tenant });
      return;
    } catch (error: unknown) {
      if (!this.current(entry)) return;
      const failure =
        error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
      const denied = failure.status === 401 || failure.status === 403;
      this.uncertain.set(failure.outcome === 'uncertain');
      this.conflict.set(
        failure.codes.some(
          (code) =>
            code === 'Tenant.ConcurrencyConflict' || code === 'Tenant.ConcurrencyTokenRequired',
        ),
      );
      if (denied) {
        this.denied.set(entry.actor);
        this.phase.set('forbidden');
      }
      this.feedback.set(
        denied
          ? 'authorization.forbidden.title'
          : this.uncertain()
            ? 'tenantManagement.mutationUncertain'
            : this.conflict()
              ? 'tenantManagement.concurrencyConflict'
              : 'tenantManagement.saveError',
      );
      const fields = { ...failure.fieldErrors };
      const mapped = (field: string, key: string) => {
        fields[field] ??= this.locale.translate(key, 'platform-tenants');
      };
      if (failure.codes.includes('Tenant.DuplicateIdentifier'))
        mapped('identifier', 'tenantManagement.duplicateIdentifier');
      if (failure.codes.includes('Tenant.InvalidEntitlement'))
        mapped('entitlements', 'tenantManagement.catalogCompatibility');
      if (failure.codes.includes('Tenant.InvalidSubscriptionStatus'))
        mapped('subscriptionStatus', 'tenantManagement.validation.invalidOption');
      if (failure.codes.includes('Tenant.SeatLimitBelowUsage')) {
        mapped('maxAdmins', 'tenantManagement.seatLimitBelowUsage');
        mapped('maxUsers', 'tenantManagement.seatLimitBelowUsage');
      }
      const errors = mapServerFieldErrors(this.form, fields, draft);
      return errors.length ? errors : undefined;
    }
  }
  close(consent: CloseConsent): void {
    if (
      !this.active() ||
      this.pending() ||
      consent.identity !== this.identity() ||
      consent.revision !== this.revision()
    )
      return;
    const review = this.uncertain();
    this.invalidate();
    if (review) this.reads?.refresh();
  }
  private invalidate(): void {
    this.cancelled.next();
    this.operation?.unsubscribe();
    this.operation = null;
    this.context.set(null);
    this.loaded.set(null);
    this.uncertain.set(false);
    this.conflict.set(false);
    this.feedback.set('');
    this.reset({ ...emptyTenantDraft });
  }
}
