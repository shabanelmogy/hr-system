import { computed, DestroyRef, effect, inject, Injectable, signal, untracked } from '@angular/core';
import { take, throwIfEmpty, type Subscription } from 'rxjs';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import { CommandFailure, UnsavedChanges } from '../../../../../shared/data/public-api';
import {
  CollectionRecordFeedback,
  FeedbackNotifications,
  type CollectionId,
  type CollectionSource,
} from '../../../../../shared/ui/public-api';
import { StateService } from '../services/state-service';
import type { StateListItem } from '../types/state';
import { stateWriteAllowed } from '../types/state-actions';
import { stateLifecycleError, type StateLifecycleAction } from '../types/state-lifecycle';
import { StateEditorState } from './state-editor-state';
import { StateReadState } from './state-read-state';

interface Confirmation {
  readonly actor: Session;
  readonly serial: number;
  readonly action: StateLifecycleAction;
  readonly source: CollectionSource<StateListItem>;
  readonly rows: readonly StateListItem[];
}
@Injectable()
export class StateLifecycleState {
  private readonly auth = inject(AuthSession);
  private readonly reads = inject(StateReadState);
  private readonly editor = inject(StateEditorState);
  private readonly records = inject(CollectionRecordFeedback);
  private readonly service = inject(StateService);
  private readonly notices = inject(FeedbackNotifications);
  private readonly drafts = inject(UnsavedChanges);
  private readonly destroy = inject(DestroyRef);
  private readonly entry = signal<Confirmation | null>(null);
  private readonly deniedActor = signal<Session | null>(null);
  private readonly selection = signal<{
    source: CollectionSource<StateListItem>;
    ids: readonly number[];
  } | null>(null);
  private serial = 0;
  private operation: Subscription | null = null;
  readonly pending = signal(false);
  readonly allowed = computed(
    () =>
      stateWriteAllowed(this.auth.readIdentity(), 'Archive') &&
      this.auth.readIdentity() !== this.deniedActor() &&
      !this.editor.active(),
  );
  readonly selected = computed(() => {
    const selection = this.selection(),
      source = this.reads.source();
    if (!this.allowed() || !selection || selection.source !== source || source.kind !== 'ready')
      return [];
    return selection.ids.filter((id) =>
      (source.result?.rows ?? []).some((row) => row.id === id && !row.isDeleted),
    );
  });
  readonly open = computed(() => {
    const entry = this.entry();
    return !!entry && this.authorized(entry);
  });
  readonly action = computed(() => this.entry()?.action ?? 'archive');
  readonly targets = computed(() => (this.open() ? (this.entry()?.rows ?? []) : []));
  readonly count = computed(() => this.targets().length);
  readonly selectable = (row: StateListItem) => this.allowed() && !row.isDeleted;
  constructor() {
    const unregister = this.drafts.register({
      read: () => ({
        identity: 'states-lifecycle:' + (this.entry()?.serial ?? 0),
        revision: 0,
        active: this.open(),
        unsaved: false,
        pending: this.pending(),
      }),
      invalidate: () => this.invalidate(),
    });
    effect(() => {
      const entry = this.entry(),
        source = this.reads.source();
      if (entry && (!this.authorized(entry) || (!this.pending() && entry.source !== source)))
        untracked(() => this.invalidate());
      const selected = this.selection();
      if (selected && (selected.source !== source || !this.allowed()))
        untracked(() => this.selection.set(null));
    });
    this.destroy.onDestroy(() => {
      unregister();
      this.operation?.unsubscribe();
    });
  }
  private authorized(entry: Confirmation) {
    return (
      entry.actor === this.auth.readIdentity() &&
      entry.actor !== this.deniedActor() &&
      stateWriteAllowed(entry.actor, entry.action === 'restore' ? 'Restore' : 'Archive') &&
      !this.editor.active()
    );
  }
  can(row: StateListItem, action: 'archive' | 'restore') {
    const source = this.reads.source(),
      actor = this.auth.readIdentity();
    return (
      !this.pending() &&
      !this.editor.active() &&
      actor !== this.deniedActor() &&
      stateWriteAllowed(actor, action === 'restore' ? 'Restore' : 'Archive') &&
      source.kind === 'ready' &&
      (source.result?.rows ?? []).some(
        (current) => current.id === row.id && current.isDeleted === (action === 'restore'),
      )
    );
  }
  select(ids: readonly CollectionId[]): void {
    const source = this.reads.source();
    if (!this.allowed() || this.pending() || source.kind !== 'ready') return;
    const eligible = new Set(
      (source.result?.rows ?? []).filter((row) => !row.isDeleted).map((row) => row.id),
    );
    this.selection.set({
      source,
      ids: [
        ...new Set(ids.filter((id): id is number => typeof id === 'number' && eligible.has(id))),
      ],
    });
  }
  clearSelection(): void {
    this.selection.set(null);
  }
  request(row: StateListItem, action: 'archive' | 'restore'): void {
    if (this.entry() || !this.can(row, action)) return;
    const source = this.reads.source();
    if (source.kind !== 'ready') return;
    const target = (source.result?.rows ?? []).find((item) => item.id === row.id);
    if (target) this.begin(action, [target], source);
  }
  requestBulk(): void {
    const source = this.reads.source(),
      ids = this.selected();
    if (this.entry() || !this.allowed() || this.pending() || source.kind !== 'ready' || !ids.length)
      return;
    if (ids.length > 100) {
      this.notices.failure('states.bulkArchiveLimitExceeded', 'reference-states', { max: 100 });
      return;
    }
    this.begin(
      'bulk',
      (source.result?.rows ?? []).filter((row) => ids.includes(row.id)),
      source,
    );
  }
  private begin(
    action: StateLifecycleAction,
    rows: readonly StateListItem[],
    source: CollectionSource<StateListItem>,
  ) {
    const actor = this.auth.readIdentity();
    if (actor) this.entry.set({ actor, serial: ++this.serial, action, rows, source });
  }
  cancel(): void {
    if (!this.pending()) this.invalidate();
  }
  confirm(): void {
    const entry = this.entry();
    if (!entry || this.pending() || !this.authorized(entry) || entry.source !== this.reads.source())
      return;
    const ids = entry.rows.map((row) => row.id),
      first = ids[0];
    if (first === undefined || ids.length > 100) return;
    this.pending.set(true);
    const request =
      entry.action === 'bulk'
        ? this.service.bulkArchive(ids)
        : entry.action === 'restore'
          ? this.service.restore(first)
          : this.service.archive(first);
    this.operation = request.pipe(take(1), throwIfEmpty()).subscribe({
      next: (count) => {
        if (!this.current(entry)) return;
        if (entry.action !== 'restore') this.records.removed(entry.source, (row) => row.id, ids);
        this.notices.success(
          entry.action === 'bulk'
            ? 'states.bulkArchived'
            : entry.action === 'restore'
              ? 'states.restored'
              : 'states.archived',
          'reference-states',
          { count },
        );
        this.invalidate();
        this.clearSelection();
        this.reads.refresh();
      },
      error: (error: unknown) => {
        if (!this.current(entry)) return;
        const failure =
            error instanceof CommandFailure ? error : new CommandFailure('uncertain', null),
          uncertain = failure.outcome === 'uncertain',
          denied = failure.status === 401 || failure.status === 403;
        this.invalidate();
        if (denied) this.deniedActor.set(entry.actor);
        this.notices.failure(
          denied
            ? 'authorization.forbidden.title'
            : uncertain
              ? 'states.lifecycleUncertain'
              : stateLifecycleError(failure.codes, entry.action),
          denied ? 'core' : 'reference-states',
          {},
          uncertain ? 'imports.submissionUncertainTitle' : 'errorDialog.title',
        );
        if (uncertain) {
          this.clearSelection();
          this.reads.refresh();
        }
      },
    });
  }
  private current(entry: Confirmation) {
    return !this.destroy.destroyed && this.entry() === entry && this.authorized(entry);
  }
  private invalidate(): void {
    this.entry.set(null);
    this.operation?.unsubscribe();
    this.operation = null;
    this.pending.set(false);
  }
}
