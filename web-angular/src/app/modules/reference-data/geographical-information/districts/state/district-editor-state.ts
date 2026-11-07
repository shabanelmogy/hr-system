import {
  computed,
  DestroyRef,
  effect,
  inject,
  Injectable,
  isDevMode,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { submit, type ValidationError } from '@angular/forms/signals';
import { firstValueFrom, Subject, take, takeUntil, throwIfEmpty, type Subscription } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { CommandFailure, UnsavedChanges } from '../../../../../shared/data/public-api';
import {
  FeedbackNotifications,
  mapServerFieldErrors,
  type CloseConsent,
} from '../../../../../shared/ui/public-api';
import { DistrictService } from '../services/district-service';
import { type DistrictDetail } from '../types/district';
import { districtWriteAllowed } from '../types/district-actions';
import {
  createDistrictForm,
  emptyDistrictDraft,
  parseDistrictMutation,
  districtDetailDraft,
  districtDraftKey,
} from '../validation/district-mutation';
import { DistrictStatesState } from './district-states-state';
import { DistrictReadState } from './district-read-state';

interface EditorContext {
  readonly actor: Session;
  readonly serial: number;
  readonly mode: 'create' | 'edit';
  readonly id: number | null;
}
export interface DistrictSaved {
  readonly mode: 'create' | 'edit';
  readonly state: DistrictDetail;
}
@Injectable()
export class DistrictEditorState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(DistrictService);
  private readonly reads = inject(DistrictReadState);
  readonly parents = inject(DistrictStatesState);
  private readonly drafts = inject(UnsavedChanges);
  private readonly notices = inject(FeedbackNotifications);
  private readonly locale = inject(LocalizationRuntime);
  private readonly destroy = inject(DestroyRef);
  private readonly context = signal<EditorContext | null>(null);
  private readonly baseline = signal(districtDraftKey(emptyDistrictDraft));
  private readonly deniedActor = signal<Session | null>(null);
  private readonly complete = new Subject<DistrictSaved>();
  private readonly invalid = new Subject<void>();
  private readonly cancelled = new Subject<void>();
  private operation: Subscription | null = null;
  private serial = 0;
  private mockIndex = 0;
  readonly saved = this.complete.asObservable();
  readonly errorsChanged = this.invalid.asObservable();
  readonly form = createDistrictForm(
    {
      submission: {
        ignoreValidators: 'none',
        action: () => this.persist(),
        onInvalid: () => this.invalid.next(),
      },
    },
    (id) => this.parents.canSelect(id),
  );
  readonly revision = linkedSignal<typeof emptyDistrictDraft, number>({
    source: () => this.form().value(),
    computation: (_value, previous) => (previous?.value ?? 0) + 1,
  });
  readonly pending = computed(() => this.form().submitting());
  readonly uncertain = signal(false);
  readonly phase = signal<'loading' | 'ready' | 'error' | 'forbidden'>('ready');
  readonly feedback = signal('');
  readonly feedbackKind = signal<'error' | 'success'>('error');
  readonly development = isDevMode();
  readonly canCreate = computed(
    () =>
      districtWriteAllowed(this.auth.readIdentity(), 'Create') &&
      this.auth.readIdentity() !== this.deniedActor() &&
      this.reads.source().kind !== 'forbidden',
  );
  readonly active = computed(() => {
    const entry = this.context();
    return (
      !!entry &&
      entry.actor === this.auth.readIdentity() &&
      districtWriteAllowed(entry.actor, entry.mode === 'create' ? 'Create' : 'Edit')
    );
  });
  readonly mode = computed(() => this.context()?.mode ?? 'create');
  readonly identity = computed(() => 'district-editor:' + (this.context()?.serial ?? 0));
  readonly unsaved = computed(
    () => this.active() && districtDraftKey(this.form().value()) !== this.baseline(),
  );
  readonly locked = computed(() => this.pending() || this.uncertain());
  readonly retainedState = computed(() => {
    const entry = this.context();
    if (!entry || entry.mode !== 'edit') return undefined;
    const detail = this.loadedDetail();
    return detail?.state;
  });
  private readonly loadedDetail = signal<DistrictDetail | null>(null);
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
      if (
        entry &&
        (entry.actor !== this.auth.readIdentity() ||
          !districtWriteAllowed(entry.actor, entry.mode === 'create' ? 'Create' : 'Edit'))
      )
        untracked(() => this.invalidate());
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.cancelled.next();
      this.cancelled.complete();
      this.operation?.unsubscribe();
      this.complete.complete();
      this.invalid.complete();
    });
  }
  canEdit(id: number): boolean {
    const view = this.reads.view();
    return (
      districtWriteAllowed(this.auth.readIdentity(), 'Edit') &&
      this.auth.readIdentity() !== this.deniedActor() &&
      view.kind === 'ready' &&
      view.data.items.some((row) => row.id === id && !row.isDeleted)
    );
  }
  create(): void {
    if (this.canCreate() && !this.active() && !this.pending() && !this.drafts.busy()) {
      this.begin('create', null);
      this.phase.set('ready');
    }
  }
  edit(id: number): void {
    if (this.canEdit(id) && !this.active() && !this.pending() && !this.drafts.busy())
      this.load(this.begin('edit', id));
  }
  private begin(mode: 'create' | 'edit', id: number | null): EditorContext {
    this.operation?.unsubscribe();
    const actor = this.auth.readIdentity();
    if (!actor) throw Error('Authenticated actor required');
    const entry = { actor, serial: ++this.serial, mode, id };
    this.context.set(entry);
    this.uncertain.set(false);
    this.feedback.set('');
    this.loadedDetail.set(null);
    this.reset(emptyDistrictDraft);
    return entry;
  }
  private current(entry: EditorContext) {
    return this.context() === entry && this.active() && !this.destroy.destroyed;
  }
  private reset(value: typeof emptyDistrictDraft) {
    this.form().reset(value);
    this.baseline.set(districtDraftKey(value));
  }
  private load(entry: EditorContext): void {
    if (!this.current(entry) || entry.id === null) return;
    this.phase.set('loading');
    this.operation?.unsubscribe();
    this.operation = this.service
      .detail(entry.id)
      .pipe(take(1), throwIfEmpty())
      .subscribe({
        next: (state) => {
          if (!this.current(entry)) return;
          if (state.isDeleted) {
            this.phase.set('error');
            return;
          }
          this.loadedDetail.set(state);
          this.reset(districtDetailDraft(state));
          this.phase.set('ready');
        },
        error: () => {
          if (this.current(entry)) this.phase.set('error');
        },
      });
  }
  retry(): void {
    const entry = this.context();
    if (entry && this.phase() === 'error' && !this.pending()) this.load(entry);
  }
  async save(): Promise<boolean> {
    const entry = this.context();
    return !!entry && this.current(entry) && !this.locked() && this.phase() === 'ready'
      ? submit(this.form)
      : false;
  }
  private async persist(): Promise<ValidationError.WithFieldTree[] | undefined> {
    const entry = this.context();
    if (!entry || !this.current(entry) || this.uncertain() || this.phase() !== 'ready')
      return [{ kind: 'unavailable', fieldTree: this.form }];
    const draft = this.form().value();
    parseDistrictMutation(draft);
    const revision = this.revision();
    try {
      const request =
        entry.mode === 'create'
          ? this.service.create(draft)
          : entry.id === null
            ? null
            : this.service.update(entry.id, draft);
      if (!request) return [{ kind: 'unavailable', fieldTree: this.form }];
      const state = await firstValueFrom(
        request.pipe(take(1), takeUntil(this.cancelled), throwIfEmpty()),
      );
      if (!this.current(entry)) return;
      this.baseline.set(districtDraftKey(draft));
      this.complete.next({ mode: entry.mode, state });
      if (this.revision() === revision) this.invalidate();
      else {
        this.feedbackKind.set('success');
        this.feedback.set(entry.mode === 'create' ? 'districts.created' : 'districts.updated');
      }
      return;
    } catch (error: unknown) {
      if (!this.current(entry)) return;
      const failure =
        error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
      const denied = failure.status === 401 || failure.status === 403;
      this.uncertain.set(failure.outcome === 'uncertain');
      const key = denied
        ? 'authorization.forbidden.title'
        : this.uncertain()
          ? 'districts.mutationUncertain'
          : failure.codes.includes('District.Duplicated')
            ? 'districts.duplicate'
            : entry.mode === 'create'
              ? 'districts.createError'
              : 'districts.updateError';
      this.feedback.set(this.uncertain() ? key : '');
      if (denied || !Object.keys(failure.fieldErrors).length)
        this.notices.failure(
          key,
          denied ? 'core' : 'reference-districts',
          {},
          this.uncertain() ? 'imports.submissionUncertainTitle' : 'errorDialog.title',
        );
      if (denied) {
        this.deniedActor.set(entry.actor);
        this.phase.set('forbidden');
      }
      const errors = mapServerFieldErrors(this.form, this.knownFieldErrors(failure), draft);
      return errors.length ? errors : undefined;
    }
  }
  private knownFieldErrors(failure: CommandFailure): Readonly<Record<string, string>> {
    const errors = { ...failure.fieldErrors };
    if (failure.codes.includes('District.Duplicated')) {
      const message = this.locale.translate('districts.duplicate', 'reference-districts');
      for (const field of ['nameAr', 'nameEn', 'code'] as const) errors[field] ??= message;
    }
    if (failure.codes.includes('District.StateNotFound'))
      errors['stateId'] ??= this.locale.translate(
        'districts.stateUnavailable',
        'reference-districts',
      );
    return errors;
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
  invalidate(): void {
    this.context.set(null);
    this.cancelled.next();
    this.operation?.unsubscribe();
    this.operation = null;
    this.uncertain.set(false);
    this.feedback.set('');
    this.loadedDetail.set(null);
    this.reset(emptyDistrictDraft);
  }
  generate(): void {
    if (!this.development || !this.active() || this.locked() || this.phase() !== 'ready') return;
    const parents = this.parents.view();
    const parent = parents.kind === 'ready' ? parents.data[0] : undefined;
    if (!parent) return;
    const samples = [
      { nameAr: 'القاهرة الجديدة', nameEn: 'New Cairo', code: 'NC' },
      { nameAr: 'مدينة نصر', nameEn: 'Nasr City', code: 'NSR' },
    ];
    const sample = samples[this.mockIndex++ % samples.length];
    if (!sample) return;
    this.form().value.set({ ...sample, stateId: parent.id });
    this.form().markAsDirty();
  }
}
