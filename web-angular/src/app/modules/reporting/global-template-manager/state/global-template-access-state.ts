import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, FormRecord } from '@angular/forms';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { filter, finalize, takeUntil } from 'rxjs';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { createScopedRead } from '../../../../shared/data/public-api';
import { FeedbackNotifications, type CollectionSource } from '../../../../shared/ui/public-api';
import { GlobalTemplateService, globalTemplateError } from '../services/global-template-service';
import {
  globalTemplateAllowed,
  globalTemplateRights,
  type GlobalTemplateDetail,
  type GlobalTemplateGrant,
  type GlobalTemplateRight,
  type GlobalTemplateRole,
} from '../types/global-template';

type RightControls = { [Right in GlobalTemplateRight]: FormControl<boolean> };

/** Per-report ACL drafts survive role search/paging; the server owns grants and concurrency. */
@Injectable()
export class GlobalTemplateAccessState {
  private readonly auth = inject(AuthSession);
  private readonly service = inject(GlobalTemplateService);
  private readonly notices = inject(FeedbackNotifications);
  private readonly destroyRef = inject(DestroyRef);
  private readonly identity = computed(() => this.auth.readIdentity());
  private readonly identityChanges = toObservable(this.identity);
  private readonly report = signal<GlobalTemplateDetail | null>(null);
  private readonly revision = signal(0);
  readonly criteria = signal({ search: '', pageIndex: 0, pageSize: 10 });
  readonly pending = signal(false);
  readonly dirty = signal(false);
  readonly draftRevision = signal(0);
  readonly draft = signal<readonly GlobalTemplateGrant[]>([]);
  readonly feedback = signal<ReturnType<typeof globalTemplateError> | null>(null);
  readonly form = new FormRecord<FormGroup<RightControls>>({});
  private readonly spec = computed(() => {
    const actor = this.identity(),
      report = this.report();
    return actor && report && globalTemplateAllowed(actor, report.entityKey)
      ? { actor, report, revision: this.revision() }
      : null;
  });
  private readonly accessRead = createScopedRead(
    this.spec,
    () => true,
    (spec) => this.service.access(spec.report.id),
  );
  readonly access = this.accessRead.state;
  readonly snapshot = computed(() => {
    const state = this.access();
    return state.kind === 'ready' ? state.data : null;
  });
  readonly canEdit = computed(() => {
    const spec = this.spec();
    return (
      !!spec &&
      !!this.snapshot()?.canEdit &&
      !this.report()?.isArchived &&
      globalTemplateAllowed(this.identity(), spec.report.entityKey, 'EditAccess')
    );
  });
  private readonly roleSpec = computed(() => {
    const spec = this.spec();
    return spec && this.canEdit() ? { ...spec, ...this.criteria() } : null;
  });
  private readonly roleRead = createScopedRead(
    this.roleSpec,
    () => true,
    (spec) => this.service.roles(spec.report.entityKey, spec.search, spec.pageIndex, spec.pageSize),
  );
  readonly readFailure = computed(() => {
    const error = this.accessRead.error() ?? this.roleRead.error();
    return error === undefined ? null : globalTemplateError(error);
  });
  readonly source = computed<CollectionSource<GlobalTemplateRole>>(() => {
    const spec = this.spec(),
      criteria = this.criteria();
    const query = {
      scopeKey: spec?.report.id ?? 'access-unavailable',
      criteriaKey: criteria.search,
      pageIndex: criteria.pageIndex,
      pageSize: criteria.pageSize,
    };
    const access = this.snapshot();
    if (!access) {
      const state = this.access();
      return { kind: state.kind === 'ready' ? 'loading' : state.kind, query };
    }
    if (!access.canView) return { kind: 'forbidden', query };
    const roles = this.roleRead.state();
    if (this.canEdit() && roles.kind !== 'ready') return { kind: roles.kind, query };
    const allRows =
      this.canEdit() && roles.kind === 'ready'
        ? roles.data.items
        : access.access.map((grant) => ({
            id: grant.roleId,
            name: grant.roleName,
            tenantId: null,
            tenantName: null,
          }));
    const matchingRows = allRows.filter((role) =>
      role.name.toLocaleLowerCase().includes(criteria.search.trim().toLocaleLowerCase()),
    );
    const rows = this.canEdit()
      ? allRows
      : matchingRows.slice(
          query.pageIndex * query.pageSize,
          (query.pageIndex + 1) * query.pageSize,
        );
    const total =
      this.canEdit() && roles.kind === 'ready' ? roles.data.totalCount : matchingRows.length;
    return {
      kind: 'ready',
      query,
      result: { query, rows, total, hasNextPage: (query.pageIndex + 1) * query.pageSize < total },
    };
  });

  constructor() {
    effect(() => {
      const snapshot = this.snapshot();
      if (snapshot && !this.dirty()) this.draft.set(snapshot.access);
    });
    effect(() => {
      const source = this.source(),
        draft = this.draft();
      if (source.kind !== 'ready') return;
      const rows = source.result?.rows ?? [];
      const ids = new Set(rows.map((role) => role.id));
      for (const id of Object.keys(this.form.controls))
        if (!ids.has(id)) this.form.removeControl(id, { emitEvent: false });
      for (const role of rows) {
        const rights = draft.find((grant) => grant.roleId === role.id)?.rights ?? [];
        const controls: RightControls = {
          Run: new FormControl(rights.includes('Run'), { nonNullable: true }),
          Download: new FormControl(rights.includes('Download'), { nonNullable: true }),
          Upload: new FormControl(rights.includes('Upload'), { nonNullable: true }),
          Publish: new FormControl(rights.includes('Publish'), { nonNullable: true }),
        };
        const existing = this.form.controls[role.id];
        if (!existing) this.form.addControl(role.id, new FormGroup(controls), { emitEvent: false });
        else
          existing.setValue(
            {
              Run: rights.includes('Run'),
              Download: rights.includes('Download'),
              Upload: rights.includes('Upload'),
              Publish: rights.includes('Publish'),
            },
            { emitEvent: false },
          );
      }
    });
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => this.captureDraft());
    effect(() => {
      this.identity();
      this.clear();
    });
  }

  select(report: GlobalTemplateDetail): void {
    this.report.set(report);
  }
  clear(): void {
    this.report.set(null);
    this.dirty.set(false);
    this.draft.set([]);
    this.feedback.set(null);
    this.criteria.set({ search: '', pageIndex: 0, pageSize: 10 });
    this.pending.set(false);
  }
  controls(roleId: string): RightControls | null {
    return this.form.controls[roleId]?.controls ?? null;
  }
  has(right: GlobalTemplateRight): boolean {
    return this.snapshot()?.allowedRights.includes(right) ?? false;
  }
  search(search: string): void {
    if (search.length <= 200) this.criteria.set({ ...this.criteria(), search, pageIndex: 0 });
  }
  page(pageIndex: number, pageSize: number): void {
    this.criteria.set({ ...this.criteria(), pageIndex, pageSize });
  }
  reload(): void {
    this.revision.update((value) => value + 1);
  }
  removeGrant(roleId: string): void {
    if (!this.canEdit() || this.pending()) return;
    this.dirty.set(true);
    this.draft.update((grants) => grants.filter((grant) => grant.roleId !== roleId));
    this.draftRevision.update((value) => value + 1);
  }
  save(): void {
    const spec = this.spec(),
      snapshot = this.snapshot();
    if (!spec || !snapshot || !this.canEdit() || this.pending()) return;
    if (this.draft().length > 100) {
      this.feedback.set({ key: 'globalTemplates.maximumRoleGrants', message: '', fields: {} });
      return;
    }
    this.pending.set(true);
    this.feedback.set(null);
    this.service
      .saveAccess(spec.report.id, snapshot.rowVersion, this.draft())
      .pipe(
        takeUntil(this.identityChanges.pipe(filter((identity) => identity !== spec.actor))),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.identity() === spec.actor) this.pending.set(false);
        }),
      )
      .subscribe({
        next: () => {
          if (this.identity() !== spec.actor || this.report()?.id !== spec.report.id) return;
          this.dirty.set(false);
          this.notices.success('crystalReports.accessSaved', 'reporting');
          this.reload();
        },
        error: (error: unknown) => {
          if (this.identity() !== spec.actor || this.report()?.id !== spec.report.id) return;
          const failure = globalTemplateError(error);
          this.feedback.set(failure);
          if (failure.key === 'globalTemplates.conflict') {
            this.dirty.set(false);
            this.reload();
          }
        },
      });
  }
  private captureDraft(): void {
    if (!this.canEdit() || this.pending()) return;
    const source = this.source();
    if (source.kind !== 'ready') return;
    const rows = source.result?.rows ?? [],
      visible = new Set(rows.map((role) => role.id));
    const grants = this.draft().filter((grant) => !visible.has(grant.roleId));
    for (const role of rows) {
      const values = this.form.controls[role.id]?.getRawValue();
      const rights = globalTemplateRights.filter((right) => values?.[right]);
      if (rights.length) grants.push({ roleId: role.id, roleName: role.name, rights });
    }
    this.dirty.set(true);
    this.draft.set(grants);
    this.draftRevision.update((value) => value + 1);
  }
}
