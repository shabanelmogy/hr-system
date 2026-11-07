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
import { DistrictService } from '../services/district-service';
import type { DistrictListItem } from '../types/district';
import { districtWriteAllowed } from '../types/district-actions';
import { districtLifecycleError, type DistrictLifecycleAction } from '../types/district-lifecycle';
import { DistrictEditorState } from './district-editor-state';
import { DistrictReadState } from './district-read-state';

interface Confirmation {
  readonly actor: Session;
  readonly serial: number;
  readonly action: DistrictLifecycleAction;
  readonly source: CollectionSource<DistrictListItem>;
  readonly rows: readonly DistrictListItem[];
}
@Injectable()
export class DistrictLifecycleState {
  private readonly auth = inject(AuthSession);
  private readonly reads = inject(DistrictReadState);
  private readonly editor = inject(DistrictEditorState);
  private readonly records = inject(CollectionRecordFeedback);
  private readonly service = inject(DistrictService);
  private readonly notices = inject(FeedbackNotifications);
  private readonly drafts = inject(UnsavedChanges);
  private readonly destroy = inject(DestroyRef);
  private readonly entry = signal<Confirmation | null>(null);
  private readonly deniedActor = signal<Session | null>(null);
  private readonly selection = signal<{
    source: CollectionSource<DistrictListItem>;
    ids: readonly number[];
  } | null>(null);
  private serial = 0;
  private operation: Subscription | null = null;
  readonly pending = signal(false);
  readonly allowed = computed(
    () =>
      districtWriteAllowed(this.auth.readIdentity(), 'Archive') &&
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
  readonly selectable = (row: DistrictListItem) => this.allowed() && !row.isDeleted;
  constructor() {
    const unregister = this.drafts.register({
      read: () => ({
        identity: 'districts-lifecycle:' + (this.entry()?.serial ?? 0),
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
      districtWriteAllowed(entry.actor, entry.action === 'restore' ? 'Restore' : 'Archive') &&
      !this.editor.active()
    );
  }
  can(row: DistrictListItem, action: 'archive' | 'restore') {
    const source = this.reads.source(),
      actor = this.auth.readIdentity();
    return (
      !this.pending() &&
      !this.editor.active() &&
      actor !== this.deniedActor() &&
      districtWriteAllowed(actor, action === 'restore' ? 'Restore' : 'Archive') &&
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
  request(row: DistrictListItem, action: 'archive' | 'restore'): void {
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
      this.notices.failure('districts.bulkArchiveLimitExceeded', 'reference-districts', {
        max: 100,
      });
      return;
    }
    this.begin(
      'bulk',
      (source.result?.rows ?? []).filter((row) => ids.includes(row.id)),
      source,
    );
  }
  private begin(
    action: DistrictLifecycleAction,
    rows: readonly DistrictListItem[],
    source: CollectionSource<DistrictListItem>,
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
            ? 'districts.bulkArchived'
            : entry.action === 'restore'
              ? 'districts.restored'
              : 'districts.archived',
          'reference-districts',
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
              ? 'districts.lifecycleUncertain'
              : districtLifecycleError(failure.codes, entry.action),
          denied ? 'core' : 'reference-districts',
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
