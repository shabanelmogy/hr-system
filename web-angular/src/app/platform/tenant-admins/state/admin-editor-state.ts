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
import { HttpErrorResponse } from '@angular/common/http';
import { submit } from '@angular/forms/signals';
import { firstValueFrom, Subject, take, takeUntil, throwIfEmpty, type Subscription } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { LocalizationRuntime } from '../../localization/public-api';
import { CommandFailure, UnsavedChanges } from '../../../shared/data/public-api';
import { mapServerFieldErrors, type CloseConsent } from '../../../shared/ui/public-api';
import { TenantAdminService } from '../services/tenant-admin-service';
import { tenantAdminAllowed, type TenantAdmin } from '../types/tenant-admin';
import {
  adminDraftKey,
  createTenantAdminForm,
  emptyAdminDraft,
  parseAdminMutation,
  repairDefaultTenant,
  type AdminDraft,
  type AdminMode,
} from '../validation/tenant-admin-mutation';
import { AdminReadState } from './admin-read-state';
import { AdminTenantChoices } from './admin-tenant-choices';
interface EditorEntry {
  readonly actor: Session;
  readonly serial: number;
  readonly mode: AdminMode;
  readonly id: string | null;
}
@Injectable()
export class AdminEditorState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(TenantAdminService);
  private readonly reads = inject(AdminReadState);
  readonly choices = inject(AdminTenantChoices);
  private readonly drafts = inject(UnsavedChanges);
  private readonly locale = inject(LocalizationRuntime);
  private readonly destroy = inject(DestroyRef);
  private readonly context = signal<EditorEntry | null>(null);
  private readonly baseline = signal(adminDraftKey(emptyAdminDraft));
  private readonly denied = signal<Session | null>(null);
  private readonly accepted = new Subject<void>();
  private readonly cancelled = new Subject<void>();
  private operation: Subscription | null = null;
  private serial = 0;
  readonly saved = this.accepted.asObservable();
  readonly mode = computed(() => this.context()?.mode ?? 'create');
  readonly phase = signal<'ready' | 'loading' | 'error' | 'forbidden'>('ready');
  readonly uncertain = signal(false);
  readonly feedback = signal('');
  readonly form = createTenantAdminForm(this.mode, () => this.choices.tenants(), {
    submission: { action: () => this.persist(), ignoreValidators: 'none' },
  });
  readonly pending = computed(() => this.form().submitting());
  readonly locked = computed(() => this.pending() || this.uncertain());
  readonly revision = linkedSignal<AdminDraft, number>({
    source: () => this.form().value(),
    computation: (_value, previous) => (previous?.value ?? 0) + 1,
  });
  private allowed(actor: Session | null): actor is Session {
    return !!actor && tenantAdminAllowed(actor) && !actor.tenantReadOnly;
  }
  readonly canWrite = computed(() => {
    const actor = this.auth.readIdentity();
    return (
      this.allowed(actor) &&
      actor !== this.denied() &&
      this.choices.ready() &&
      this.reads.view().kind !== 'forbidden'
    );
  });
  readonly active = computed(() => {
    const entry = this.context();
    return !!entry && entry.actor === this.auth.readIdentity() && this.allowed(entry.actor);
  });
  readonly identity = computed(() => 'tenant-admin:' + (this.context()?.serial ?? 0));
  readonly unsaved = computed(
    () => this.active() && adminDraftKey(this.form().value()) !== this.baseline(),
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
      this.accepted.complete();
    });
  }
  create(tenantId: string | null = null): void {
    if (!this.canWrite() || this.active() || this.pending() || this.drafts.busy()) return;
    if (tenantId !== null && !this.choices.tenants().some((tenant) => tenant.id === tenantId))
      return;
    this.begin('create', null);
    this.reset({
      ...emptyAdminDraft,
      ...(tenantId ? { tenantIds: [tenantId], defaultTenantId: tenantId } : {}),
    });
    this.phase.set('ready');
  }
  edit(id: string): void {
    if (!this.canWrite() || !id.trim() || this.active() || this.pending() || this.drafts.busy())
      return;
    this.load(this.begin('edit', id));
  }
  private begin(mode: AdminMode, id: string | null): EditorEntry {
    const actor = this.auth.readIdentity();
    if (!this.allowed(actor)) throw Error('Writable global actor required');
    const entry = { actor, serial: ++this.serial, mode, id };
    this.context.set(entry);
    this.feedback.set('');
    this.uncertain.set(false);
    this.reset({ ...emptyAdminDraft });
    return entry;
  }
  private reset(draft: AdminDraft): void {
    this.form().reset(draft);
    this.baseline.set(adminDraftKey(draft));
  }
  private current(entry: EditorEntry): boolean {
    return !this.destroy.destroyed && this.context() === entry && this.active();
  }
  private load(entry: EditorEntry): void {
    if (!entry.id || !this.current(entry)) return;
    this.phase.set('loading');
    this.operation?.unsubscribe();
    this.operation = this.service
      .detail(entry.id)
      .pipe(take(1), throwIfEmpty())
      .subscribe({
        next: (record: TenantAdmin) => {
          if (!this.current(entry)) return;
          if (record.lifecycleStatus !== 'active') {
            this.feedback.set('tenantAdmins.errors.archived');
            this.phase.set('error');
            return;
          }
          this.reset({
            firstName: record.firstName,
            lastName: record.lastName,
            userName: record.userName,
            email: record.email,
            password: '',
            isDisabled: record.isDisabled,
            tenantIds: record.tenants.map((tenant) => tenant.id),
            defaultTenantId: record.defaultTenantId,
          });
          this.phase.set('ready');
        },
        error: (error: unknown) => {
          if (!this.current(entry)) return;
          if (error instanceof HttpErrorResponse && [401, 403].includes(error.status)) {
            this.denied.set(entry.actor);
            this.phase.set('forbidden');
          } else this.phase.set('error');
        },
      });
  }
  retry(): void {
    const entry = this.context();
    if (entry && this.phase() === 'error' && !this.locked()) this.load(entry);
  }
  membershipsChanged(values: readonly (string | number)[]): void {
    if (!this.active() || this.locked() || values.some((value) => typeof value !== 'string'))
      return;
    const ids: string[] = [];
    for (const value of values) if (typeof value === 'string') ids.push(value);
    if (JSON.stringify(this.form.tenantIds().value()) !== JSON.stringify(ids))
      this.form.tenantIds().value.set(ids);
    const current = this.form.defaultTenantId().value(),
      next = repairDefaultTenant(ids, current);
    if (next !== current) this.form.defaultTenantId().value.set(next);
  }
  save(): Promise<boolean> | false {
    return this.active() && this.canWrite() && !this.locked() && this.phase() === 'ready'
      ? submit(this.form)
      : false;
  }
  private async persist() {
    const entry = this.context();
    if (
      !entry ||
      !this.current(entry) ||
      !this.canWrite() ||
      this.uncertain() ||
      this.phase() !== 'ready'
    )
      return [{ kind: 'unavailable', fieldTree: this.form }];
    const draft = this.form().value(),
      payload = parseAdminMutation(draft, entry.mode, this.choices.tenants());
    try {
      const request =
        entry.mode === 'create'
          ? this.service.create(payload)
          : entry.id
            ? this.service.update(entry.id, payload)
            : null;
      if (!request) return [{ kind: 'unavailable', fieldTree: this.form }];
      await firstValueFrom(request.pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()));
      if (!this.current(entry)) return;
      this.invalidate();
      this.accepted.next();
      return;
    } catch (error: unknown) {
      if (!this.current(entry)) return;
      const failure =
        error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
      this.uncertain.set(failure.outcome === 'uncertain');
      const denied = failure.status === 401 || failure.status === 403;
      if (denied) {
        this.denied.set(entry.actor);
        this.phase.set('forbidden');
      }
      this.feedback.set(
        denied
          ? 'authorization.forbidden.title'
          : this.uncertain()
            ? 'tenantAdmins.errors.uncertain'
            : 'tenantAdmins.errors.save',
      );
      const fields = { ...failure.fieldErrors };
      const set = (field: string, key: string) => {
        fields[field] ??= this.locale.translate('tenantAdmins.errors.' + key, 'platform-tenants');
      };
      for (const code of failure.codes) {
        if (code === 'TenantAdmin.DuplicateEmail' || code === 'DuplicateEmail')
          set('email', 'duplicateEmail');
        else if (code === 'TenantAdmin.DuplicateUserName' || code === 'DuplicateUserName')
          set('userName', 'duplicateUserName');
        else if (code === 'TenantAdmin.AdminSeatLimitReached') set('tenantIds', 'seatLimit');
        else if (code === 'TenantAdmin.InvalidTenants') set('tenantIds', 'invalidTenants');
        else if (code === 'InvalidEmail') set('email', 'invalidEmail');
        else if (code === 'InvalidUserName') set('userName', 'invalidUserName');
        else if (code.startsWith('Password')) set('password', 'passwordRequirements');
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
    const refresh = this.uncertain();
    this.invalidate();
    if (refresh) this.reads.refresh();
  }
  private invalidate(): void {
    this.cancelled.next();
    this.operation?.unsubscribe();
    this.operation = null;
    this.context.set(null);
    this.uncertain.set(false);
    this.feedback.set('');
    this.reset({ ...emptyAdminDraft });
  }
}
