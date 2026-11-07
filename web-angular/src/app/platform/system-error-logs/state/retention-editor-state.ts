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
import { submit, type ValidationError } from '@angular/forms/signals';
import { firstValueFrom, Subject, take, takeUntil, throwIfEmpty } from 'rxjs';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { CommandFailure, UnsavedChanges } from '../../../shared/data/public-api';
import {
  FeedbackNotifications,
  mapServerFieldErrors,
  type CloseConsent,
} from '../../../shared/ui/public-api';
import { SystemErrorLogService } from '../services/system-error-log-service';
import { errorLogSettingsEditAllowed } from '../system-error-log-access';
import {
  createRetentionForm,
  parseRetentionDraft,
  type RetentionDraft,
} from '../validation/retention-form';
import { ErrorLogSettingsState } from './error-log-settings-state';

interface RetentionContext {
  readonly actor: Session;
  readonly serial: number;
}
interface RetentionRevision {
  readonly draft: RetentionDraft;
  readonly expectedRevision: number | null;
  readonly context: RetentionContext | null;
}

/** Retention draft, expected revision and explicit recovery are one editor lifetime. */
@Injectable()
export class RetentionEditorState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(SystemErrorLogService);
  private readonly reads = inject(ErrorLogSettingsState);
  private readonly drafts = inject(UnsavedChanges);
  private readonly destroy = inject(DestroyRef);
  private readonly notices = inject(FeedbackNotifications);
  private readonly context = signal<RetentionContext | null>(null);
  private readonly baseline = signal('');
  private readonly denied = signal<Session | null>(null);
  private readonly cancelled = new Subject<void>();
  private serial = 0;
  readonly expectedRevision = signal<number | null>(null);
  readonly conflict = signal(false);
  readonly uncertain = signal(false);
  readonly feedback = signal<'error' | 'conflict' | 'uncertain' | 'forbidden' | ''>('');
  readonly reloading = signal(false);
  readonly form = createRetentionForm({
    submission: { action: () => this.persist(), ignoreValidators: 'none' },
  });
  readonly pending = computed(() => this.form().submitting() || this.reloading());
  readonly revision = linkedSignal<RetentionRevision, number>({
    source: () => ({
      draft: this.form().value(),
      expectedRevision: this.expectedRevision(),
      context: this.context(),
    }),
    computation: (_value, previous) => (previous?.value ?? 0) + 1,
  });
  readonly canEdit = computed(() => {
    const actor = this.auth.readIdentity();
    return errorLogSettingsEditAllowed(actor) && this.reads.canRead() && actor !== this.denied();
  });
  readonly active = computed(() => {
    const context = this.context();
    return (
      !!context &&
      context.actor === this.auth.readIdentity() &&
      errorLogSettingsEditAllowed(context.actor) &&
      this.reads.canRead()
    );
  });
  readonly identity = computed(() => 'error-log-retention:' + (this.context()?.serial ?? 0));
  readonly unsaved = computed(
    () =>
      this.active() &&
      (this.form.retentionDays().value().trim() !== this.baseline() || this.uncertain()),
  );
  readonly locked = computed(
    () => this.pending() || this.conflict() || this.uncertain() || !this.canEdit(),
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
      if (this.context() && !this.active()) untracked(() => this.invalidate());
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.invalidate();
      this.cancelled.complete();
    });
  }
  open(): void {
    const actor = this.auth.readIdentity(),
      view = this.reads.view();
    if (
      !actor ||
      !this.canEdit() ||
      this.active() ||
      this.pending() ||
      this.reads.pending() ||
      this.drafts.busy() ||
      view.kind !== 'ready'
    )
      return;
    this.context.set({ actor, serial: ++this.serial });
    this.reset(view.data.retentionDays, view.data.revision);
  }
  private reset(days: number, revision: number): void {
    this.form().reset({ retentionDays: String(days) });
    this.baseline.set(String(days));
    this.expectedRevision.set(revision);
    this.conflict.set(false);
    this.uncertain.set(false);
    this.feedback.set('');
  }
  private current(context: RetentionContext): boolean {
    return !this.destroy.destroyed && this.context() === context && this.active();
  }
  save(): Promise<boolean> | false {
    return this.active() && !this.locked() ? submit(this.form) : false;
  }
  private async persist(): Promise<ValidationError.WithFieldTree[] | undefined> {
    const context = this.context(),
      revision = this.expectedRevision();
    if (
      !context ||
      !this.current(context) ||
      revision === null ||
      !this.canEdit() ||
      this.conflict() ||
      this.uncertain()
    )
      return [{ kind: 'unavailable', fieldTree: this.form }];
    const draft = this.form().value();
    try {
      await firstValueFrom(
        this.service
          .saveSettings(parseRetentionDraft(draft), revision)
          .pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(context) || !this.canEdit()) return;
      this.invalidate();
      this.reads.refresh();
      this.notices.success('errorLogSettings.saved', 'platform-advanced-tools');
    } catch (error: unknown) {
      if (!this.current(context)) return;
      const failure =
        error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
      if (failure.status === 401) this.reads.deny(context.actor);
      if (failure.status === 403) this.denied.set(context.actor);
      this.conflict.set(failure.status === 409);
      this.uncertain.set(failure.outcome === 'uncertain');
      this.feedback.set(
        failure.status === 401 || failure.status === 403
          ? 'forbidden'
          : this.conflict()
            ? 'conflict'
            : this.uncertain()
              ? 'uncertain'
              : 'error',
      );
      const message =
        failure.fieldErrors['retentionDays'] ?? failure.fieldErrors['Request.RetentionDays'];
      return message
        ? mapServerFieldErrors(this.form, { retentionDays: message }, draft)
        : undefined;
    }
    return;
  }
  reloadRevision(): Promise<void> {
    return this.conflict() && !this.uncertain() ? this.reload(false) : Promise.resolve();
  }
  async loadCurrent(): Promise<void> {
    const context = this.context();
    if (!context || !this.current(context) || this.pending() || !this.canEdit()) return;
    const stamp = this.drafts.stamp();
    if (
      !(await this.drafts.request('error-log-retention:load-current')) ||
      !this.drafts.matches(stamp) ||
      !this.current(context) ||
      !this.canEdit()
    )
      return;
    await this.reload(true);
  }
  private async reload(reset: boolean): Promise<void> {
    const context = this.context();
    if (!context || !this.current(context) || this.pending() || !this.canEdit()) return;
    this.reloading.set(true);
    try {
      const settings = await firstValueFrom(
        this.service.settings().pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(context) || !this.canEdit()) return;
      this.reads.refresh();
      if (reset) this.reset(settings.retentionDays, settings.revision);
      else {
        this.expectedRevision.set(settings.revision);
        this.conflict.set(false);
        this.feedback.set('');
      }
    } catch (error: unknown) {
      if (!this.current(context)) return;
      if (error instanceof HttpErrorResponse && [401, 403].includes(error.status)) {
        this.reads.deny(context.actor);
        this.feedback.set('forbidden');
      } else this.feedback.set('error');
    } finally {
      if (this.context() === context) this.reloading.set(false);
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
    if (review) this.reads.refresh();
  }
  private invalidate(): void {
    this.cancelled.next();
    this.context.set(null);
    this.reloading.set(false);
    this.form().reset({ retentionDays: '' });
    this.expectedRevision.set(null);
    this.baseline.set('');
    this.conflict.set(false);
    this.uncertain.set(false);
    this.feedback.set('');
  }
}
