import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { type Subscription, take, throwIfEmpty } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { CommandFailure, UnsavedChanges } from '../../../../../shared/data/public-api';
import {
  SpreadsheetFiles,
  SpreadsheetError,
  type ImportPhase,
} from '../../../../../shared/data/spreadsheet-public-api';
import { StateService } from '../services/state-service';
import { StateReadState } from './state-read-state';
import { StateCountriesState } from './state-countries-state';
import { stateWriteAllowed } from '../types/state-actions';
import {
  stateImportPolicy,
  stateImportRows,
  validateStateImport,
  type StateImportRow,
} from '../validation/state-import';
import { stateImportDuplicate, stateImportFailureRows } from '../validation/state-import-feedback';

@Injectable()
export class StateImportState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(StateService);
  private readonly files = inject(SpreadsheetFiles);
  private readonly reads = inject(StateReadState);
  readonly parents = inject(StateCountriesState);
  private readonly drafts = inject(UnsavedChanges);
  private readonly destroy = inject(DestroyRef);
  private readonly owner = signal<Session | null>(null);
  private readonly denied = signal<Session | null>(null);
  private readonly data = signal<readonly StateImportRow[]>([]);
  private readonly step = signal<ImportPhase>('idle');
  private readonly name = signal('');
  private readonly feedback = signal('');
  private readonly revision = signal(0);
  private operation: Subscription | null = null;
  private generation = 0;
  readonly policy = stateImportPolicy;
  readonly allowed = computed(
    () =>
      stateWriteAllowed(this.auth.readIdentity(), 'Create') &&
      this.reads.source().kind !== 'forbidden' &&
      this.denied() !== this.auth.readIdentity(),
  );
  private readonly current = computed(
    () => this.allowed() && this.owner() === this.auth.readIdentity(),
  );
  readonly rows = computed(() => (this.current() ? this.data() : []));
  readonly fileName = computed(() => (this.current() ? this.name() : ''));
  readonly phase = computed<ImportPhase>(() => (this.current() ? this.step() : 'idle'));
  readonly message = computed(() => (this.current() ? this.feedback() : ''));
  readonly busy = computed(() => this.phase() === 'parsing' || this.phase() === 'submitting');
  readonly uncertain = computed(() => this.phase() === 'uncertain');
  readonly unsaved = computed(() => this.rows().some((row) => row.status === 'pending'));
  constructor() {
    const unregister = this.drafts.register({
      read: () => ({
        identity: 'states-import:' + this.generation,
        revision: this.revision(),
        active: this.current(),
        unsaved: this.unsaved(),
        pending: this.busy(),
      }),
      invalidate: () => this.invalidate(),
    });
    effect(() => {
      if (this.owner() && !this.current()) untracked(() => this.invalidate());
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.invalidate();
    });
  }
  private owns(actor: Session, serial: number): boolean {
    return (
      !this.destroy.destroyed &&
      this.owner() === actor &&
      this.auth.readIdentity() === actor &&
      serial === this.generation &&
      this.allowed()
    );
  }
  async select(file: File): Promise<void> {
    const actor = this.auth.readIdentity();
    if (!actor || !this.allowed() || this.busy() || this.uncertain()) return;
    const stamp = this.drafts.stamp();
    if (
      !(await this.drafts.request('state-import:replace')) ||
      !this.drafts.matches(stamp) ||
      this.auth.readIdentity() !== actor ||
      !this.allowed()
    )
      return;
    this.invalidate();
    this.owner.set(actor);
    this.name.set(file.name);
    this.step.set('parsing');
    const serial = this.generation;
    try {
      const rows = await this.files.parse(file, this.policy);
      if (!this.owns(actor, serial)) return;
      this.data.set(stateImportRows(rows));
      this.step.set('preview');
      this.revision.update((v) => v + 1);
    } catch (error) {
      if (!this.owns(actor, serial)) return;
      const e = error instanceof SpreadsheetError ? error : new SpreadsheetError('parseFailed');
      this.details.set(e.details);
      this.feedback.set('imports.errors.' + e.code);
      this.step.set('failed');
    }
  }
  private readonly details = signal<Record<string, string | number>>({});
  readonly errorDetails = computed<Record<string, string | number>>(() =>
    this.current() ? this.details() : {},
  );
  readonly lookupStatus = computed(() => {
    const parent = this.parents.view();
    return parent.kind === 'ready' ? (parent.data.length ? 'ready' : 'empty') : parent.kind;
  });
  readonly canSubmit = computed(
    () => this.phase() === 'preview' && this.lookupStatus() === 'ready',
  );
  async clear(): Promise<void> {
    if (this.busy()) return;
    const stamp = this.drafts.stamp();
    if ((await this.drafts.request('state-import:clear')) && this.drafts.matches(stamp))
      this.invalidate();
  }
  submit(): void {
    const actor = this.owner();
    const parents = this.parents.view();
    if (!actor || !this.current() || this.busy() || !this.canSubmit() || parents.kind !== 'ready')
      return;
    const serial = this.generation,
      checked = validateStateImport(this.rows(), parents.data);
    this.data.set(checked.rows);
    this.revision.update((v) => v + 1);
    if (!checked.valid.length) {
      this.feedback.set('imports.noValidRows');
      this.step.set('failed');
      return;
    }
    this.step.set('submitting');
    this.feedback.set('');
    this.operation = this.service
      .bulkCreate(checked.valid)
      .pipe(take(1), throwIfEmpty())
      .subscribe({
        next: () => {
          if (!this.owns(actor, serial)) return;
          this.data.update((rows) =>
            rows.map((row) => (row.status === 'submitted' ? { ...row, status: 'uploaded' } : row)),
          );
          this.step.set('succeeded');
          this.feedback.set('states.import.importSuccess');
          this.details.set({ count: checked.valid.length });
          this.reads.refresh();
        },
        error: (error: unknown) => {
          if (!this.owns(actor, serial)) return;
          const e = error instanceof CommandFailure ? error : new CommandFailure('uncertain', null);
          if (e.status === 401 || e.status === 403) {
            this.denied.set(actor);
            this.invalidate();
            return;
          }
          const uncertain = e.outcome === 'uncertain';
          this.data.update((rows) => stateImportFailureRows(rows, e));
          this.step.set(uncertain ? 'uncertain' : 'failed');
          this.feedback.set(
            uncertain
              ? 'imports.submissionUncertain'
              : stateImportDuplicate(e)
                ? 'states.import.duplicateOnServer'
                : e.codes.includes('State.CountryNotFound')
                  ? 'states.countryUnavailable'
                  : e.outcome === 'not-sent'
                    ? 'imports.notSent'
                    : 'imports.batchRejected',
          );
          if (uncertain) this.reads.refresh();
        },
      });
  }
  async download(): Promise<Blob | null> {
    if (!this.allowed() || this.busy()) return null;
    const actor = this.auth.readIdentity();
    try {
      const blob = await this.files.template(this.policy.headers);
      return actor === this.auth.readIdentity() && this.allowed() ? blob : null;
    } catch {
      this.owner.set(actor);
      this.feedback.set('imports.errors.templateFailed');
      return null;
    }
  }
  invalidate(): void {
    this.generation++;
    this.operation?.unsubscribe();
    this.operation = null;
    this.owner.set(null);
    this.data.set([]);
    this.name.set('');
    this.step.set('idle');
    this.feedback.set('');
    this.details.set({});
    this.revision.update((v) => v + 1);
  }
}
