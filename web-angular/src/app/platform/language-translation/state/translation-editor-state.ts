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
import { firstValueFrom, Subject, take, takeUntil, throwIfEmpty } from 'rxjs';
import { submit, type ValidationError } from '@angular/forms/signals';
import { AuthSession, type Session } from '../../auth/session.public-api';
import { CommandFailure, UnsavedChanges } from '../../../shared/data/public-api';
import {
  FeedbackNotifications,
  mapServerFieldErrors,
  type CloseConsent,
} from '../../../shared/ui/public-api';
import { LanguageTranslationService } from '../services/language-translation-service';
import { LanguageTranslationState } from './language-translation-state';
import { createTranslationForm } from '../validation/translation-form';
import type { LanguageTranslationRow } from '../types/language-translation';
import type { UiLanguage } from '../../localization/public-api';

interface TextTarget {
  readonly serial: number;
  readonly actor: Session;
  readonly row: LanguageTranslationRow;
  readonly source: string;
  readonly language: UiLanguage;
  readonly revision: number;
  readonly reset: boolean;
}
@Injectable()
export class TranslationEditorState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(LanguageTranslationService);
  private readonly reads = inject(LanguageTranslationState);
  private readonly drafts = inject(UnsavedChanges);
  private readonly notices = inject(FeedbackNotifications);
  private readonly destroy = inject(DestroyRef);
  private readonly context = signal<TextTarget | null>(null);
  private readonly cancelled = new Subject<void>();
  private serial = 0;
  readonly target = computed(() => (this.active() ? this.context() : null));
  readonly feedback = signal<'error' | 'conflict' | 'uncertain' | 'forbidden' | ''>('');
  readonly resetPending = signal(false);
  readonly canEdit = computed(() => this.allowed('SystemUiTexts:Edit'));
  readonly canReset = computed(() => this.allowed('SystemUiTexts:Reset'));
  readonly active = computed(() => {
    const context = this.context();
    return !!context && context.actor === this.auth.readIdentity() && this.reads.canRead();
  });
  readonly form = createTranslationForm(() => this.context()?.row.shippedValue ?? '', {
    submission: { action: () => this.persist(), ignoreValidators: 'none' },
  });
  readonly pending = computed(() => this.form().submitting() || this.resetPending());
  readonly locked = computed(
    () =>
      this.pending() ||
      !this.canEdit() ||
      ['conflict', 'uncertain', 'forbidden'].includes(this.feedback()),
  );
  readonly identity = computed(() => 'system-text:' + (this.context()?.serial ?? 0));
  readonly revision = linkedSignal<string, number>({
    source: () => JSON.stringify([this.form().value(), this.context()]),
    computation: (_value, previous) => (previous?.value ?? 0) + 1,
  });
  readonly unsaved = computed(
    () =>
      this.active() &&
      (this.form.value().value() !== this.context()?.row.targetValue ||
        this.feedback() === 'uncertain'),
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
  private allowed(permission: string): boolean {
    const actor = this.auth.readIdentity();
    return (
      !!actor &&
      this.reads.canRead() &&
      !actor.tenantReadOnly &&
      actor.permissions.includes(permission)
    );
  }
  open(row: LanguageTranslationRow, reset = false): void {
    const actor = this.auth.readIdentity(),
      view = this.reads.textsView();
    if (
      !actor ||
      this.active() ||
      this.pending() ||
      this.reads.pending() ||
      this.drafts.busy() ||
      (reset ? !this.canReset() || !row.isCustomized : !this.canEdit()) ||
      view.kind !== 'ready' ||
      !view.data.items.includes(row)
    )
      return;
    this.context.set({
      serial: ++this.serial,
      actor,
      row,
      reset,
      revision: view.data.revision,
      source: this.reads.sourceId(),
      language: this.reads.query().targetLanguage,
    });
    this.form().reset({ value: row.targetValue });
    this.feedback.set('');
  }
  save(): Promise<boolean> | false {
    return this.active() && !this.locked() ? submit(this.form) : false;
  }
  private current(target: TextTarget): boolean {
    return !this.destroy.destroyed && this.context() === target && this.active();
  }
  private async persist(): Promise<ValidationError.WithFieldTree[] | undefined> {
    const target = this.context();
    if (
      !target ||
      !this.current(target) ||
      !this.canEdit() ||
      target.reset ||
      this.lockedForWrite()
    )
      return;
    const draft = this.form().value();
    try {
      await firstValueFrom(
        this.service
          .update({
            source: target.source,
            language: target.language,
            key: target.row.key,
            value: draft.value,
            expectedRevision: target.revision,
          })
          .pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (this.current(target)) this.saved();
    } catch (error: unknown) {
      if (!this.current(target)) return;
      const failure = this.failed(error);
      const message =
        failure.fieldErrors['value'] ??
        failure.fieldErrors['Value'] ??
        failure.fieldErrors['Request.Value'] ??
        failure.fieldErrors['request.value'];
      if (message) return mapServerFieldErrors(this.form, { value: message }, draft);
    }
    return;
  }
  async confirmReset(): Promise<void> {
    const target = this.context();
    if (
      !target?.reset ||
      !this.current(target) ||
      !this.canReset() ||
      this.pending() ||
      this.lockedForWrite()
    )
      return;
    this.resetPending.set(true);
    try {
      await firstValueFrom(
        this.service
          .reset({
            source: target.source,
            language: target.language,
            key: target.row.key,
            expectedRevision: target.revision,
          })
          .pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (this.current(target)) this.saved();
    } catch (error: unknown) {
      if (this.current(target)) this.failed(error);
    } finally {
      if (this.context() === target) this.resetPending.set(false);
    }
  }
  private lockedForWrite(): boolean {
    return ['conflict', 'uncertain', 'forbidden'].includes(this.feedback());
  }
  private failed(error: unknown): CommandFailure {
    const failure = error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
    this.feedback.set(
      failure.status === 401 || failure.status === 403
        ? 'forbidden'
        : failure.status === 409
          ? 'conflict'
          : failure.outcome === 'uncertain'
            ? 'uncertain'
            : 'error',
    );
    return failure;
  }
  async reload(): Promise<void> {
    if (this.pending()) return;
    const target = this.context(),
      stamp = this.drafts.stamp();
    const approved = await this.drafts.request('system-text:reload');
    if (
      !target ||
      !approved ||
      !this.drafts.matches(stamp) ||
      !this.current(target) ||
      this.pending()
    )
      return;
    this.invalidate();
    this.reads.refresh();
  }
  close(consent: CloseConsent): void {
    if (
      !this.pending() &&
      consent.identity === this.identity() &&
      consent.revision === this.revision()
    )
      this.invalidate();
  }
  cancelReset(): void {
    if (!this.pending()) this.invalidate();
  }
  private saved(): void {
    this.invalidate();
    this.reads.refresh();
    this.notices.success('systemUiTexts.saved', 'platform-auth');
  }
  private invalidate(): void {
    this.cancelled.next();
    this.context.set(null);
    this.feedback.set('');
    this.resetPending.set(false);
    this.form().reset({ value: '' });
  }
}
