import { computed, DestroyRef, effect, inject, Injectable, signal } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  filter,
  finalize,
  map,
  of,
  switchMap,
  throwError,
  takeUntil,
  type Observable,
} from 'rxjs';
import { AuthSession } from '../../../../platform/auth/session.public-api';
import { createScopedRead, downloadBlob, UnsavedChanges } from '../../../../shared/data/public-api';
import type { GridFilters } from '../../../../shared/data/public-api';
import { parseGlobalTemplateFilters } from '../types/global-template-filters';
import {
  applyServerFieldErrors,
  FeedbackNotifications,
  type CollectionSource,
} from '../../../../shared/ui/public-api';
import { GlobalTemplateService, globalTemplateError } from '../services/global-template-service';
import { GlobalTemplateAccessState } from './global-template-access-state';
import {
  globalTemplateAllowed,
  globalTemplateFileError,
  globalTemplateManagerAllowed,
  type GlobalTemplateAction,
  type GlobalTemplateCandidate,
  type GlobalTemplateDetail,
  type GlobalTemplateEntity,
  type GlobalTemplateRow,
  type GlobalTemplateVersion,
  type GlobalTemplateUploadTarget,
} from '../types/global-template';

interface GlobalTemplateEditorContext {
  actor: object;
  entity: GlobalTemplateEntity;
  reportId: string | null;
  revision: number;
}
interface ReplacementConfirmation {
  editor: GlobalTemplateEditorContext;
  file: File;
  draftRevision: number;
  report: GlobalTemplateDetail;
}
type SaveOutcome =
  | { kind: 'saved'; detail: GlobalTemplateDetail }
  | { kind: 'duplicate'; target: GlobalTemplateUploadTarget };

@Injectable()
export class GlobalTemplateState {
  readonly access = inject(GlobalTemplateAccessState);
  private readonly auth = inject(AuthSession);
  private readonly service = inject(GlobalTemplateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly unsaved = inject(UnsavedChanges);
  private readonly notices = inject(FeedbackNotifications);
  readonly identity = computed(() => this.auth.readIdentity());
  private readonly identityChanges = toObservable(this.identity);
  readonly allowed = computed(() => globalTemplateManagerAllowed(this.identity()));
  private readonly requestedEntity = signal<GlobalTemplateEntity | ''>('countries');
  private readonly candidateEntity = signal<GlobalTemplateEntity>('countries');
  readonly criteria = signal({ search: '', status: '', pageIndex: 0, pageSize: 10 });
  readonly columnFilters = signal<GridFilters>([]);
  private readonly refresh = signal(0);
  private readonly entitiesRead = createScopedRead(
    this.identity,
    globalTemplateManagerAllowed,
    () => this.service.entities(),
  );
  readonly entities = this.entitiesRead.state;
  readonly contracts = computed(() => {
    const state = this.entities();
    return state.kind === 'ready'
      ? state.data.filter((entity) => globalTemplateAllowed(this.identity(), entity.entityKey))
      : [];
  });
  readonly filterEntity = computed<GlobalTemplateEntity | '' | null>(() =>
    this.requestedEntity() === ''
      ? ''
      : (this.contracts().find((entity) => entity.entityKey === this.requestedEntity())
          ?.entityKey ??
        this.contracts()[0]?.entityKey ??
        null),
  );
  readonly entity = computed(
    () =>
      this.editor()?.entity ??
      this.selected()?.entity ??
      (this.candidatesOpen() ? this.candidateEntity() : null) ??
      (this.filterEntity() || this.contracts()[0]?.entityKey) ??
      null,
  );
  readonly spec = computed(() => {
    const actor = this.identity(),
      entity = this.filterEntity();
    return actor && entity !== null && this.contracts().length
      ? {
          actor,
          entity,
          ...this.criteria(),
          filters: this.columnFilters(),
          revision: this.refresh(),
        }
      : null;
  });
  private readonly listRead = createScopedRead(
    this.spec,
    () => true,
    (spec) =>
      this.service.list(
        spec.entity,
        spec.search,
        spec.pageIndex,
        spec.pageSize,
        spec.status,
        spec.filters,
      ),
  );
  readonly listing = this.listRead.state;
  readonly source = computed<CollectionSource<GlobalTemplateRow>>(() => {
    const spec = this.spec();
    const query = {
      scopeKey: spec
        ? JSON.stringify([spec.actor.userId, spec.entity])
        : 'global-template-unavailable',
      criteriaKey: JSON.stringify([spec?.search ?? '', spec?.status ?? '', spec?.filters ?? []]),
      pageIndex: spec?.pageIndex ?? 0,
      pageSize: spec?.pageSize ?? 10,
    };
    const listing = this.listing();
    return listing.kind === 'ready'
      ? {
          kind: 'ready',
          query,
          result: {
            query,
            rows: listing.data.items,
            total: listing.data.totalCount,
            hasNextPage: (query.pageIndex + 1) * query.pageSize < listing.data.totalCount,
          },
        }
      : { kind: listing.kind, query };
  });
  private readonly selected = signal<{
    actor: object;
    entity: GlobalTemplateEntity;
    id: string;
  } | null>(null);
  private readonly detailSpec = computed(() => {
    const selected = this.selected();
    return selected?.actor === this.identity() &&
      globalTemplateAllowed(this.identity(), selected.entity)
      ? { ...selected, revision: this.refresh() }
      : null;
  });
  private readonly detailRead = createScopedRead(
    this.detailSpec,
    () => true,
    (selection) => this.service.detail(selection.id),
  );
  readonly detailState = this.detailRead.state;
  readonly detail = computed(() => {
    const state = this.detailState();
    return this.detailSpec() && state.kind === 'ready' ? state.data : null;
  });
  readonly detailOpen = computed(() => this.detailSpec() !== null);
  readonly editor = signal<GlobalTemplateEditorContext | null>(null);
  readonly replacementTarget = signal<ReplacementConfirmation | null>(null);
  readonly editorOpen = computed(() => {
    const editor = this.editor();
    return !!editor && editor.actor === this.identity() && editor.entity === this.entity();
  });
  private readonly commandPending = signal(false);
  readonly pending = computed(() => this.commandPending() || this.access.pending());
  readonly archiveTarget = signal<GlobalTemplateRow | null>(null);
  readonly feedback = signal<{
    key: string;
    message: string;
    fields: Record<string, string>;
  } | null>(null);
  readonly inspection = signal<{ valid: boolean; reason: string | null } | null>(null);
  readonly candidatesOpen = signal(false);
  readonly candidateCriteria = signal({ search: '', pageIndex: 0, pageSize: 10 });
  private readonly candidateRevision = signal(0);
  private readonly registeredSources = signal<ReadonlySet<string>>(new Set());
  private readonly candidateSpec = computed(() => {
    const actor = this.identity(),
      entity = this.entity();
    return this.candidatesOpen() &&
      actor &&
      entity &&
      globalTemplateAllowed(actor, entity, 'Create')
      ? { actor, entity, ...this.candidateCriteria(), revision: this.candidateRevision() }
      : null;
  });
  private readonly candidatesRead = createScopedRead(
    this.candidateSpec,
    () => true,
    (spec) => this.service.candidates(spec.entity, spec.search, spec.pageIndex, spec.pageSize),
  );
  readonly candidateSource = computed<CollectionSource<GlobalTemplateCandidate>>(() => {
    const spec = this.candidateSpec();
    const query = {
      scopeKey: spec
        ? JSON.stringify([spec.actor.userId, spec.entity, 'registration'])
        : 'registration-unavailable',
      criteriaKey: spec?.search ?? '',
      pageIndex: spec?.pageIndex ?? 0,
      pageSize: spec?.pageSize ?? 10,
    };
    const result = this.candidatesRead.state();
    return result.kind === 'ready'
      ? {
          kind: 'ready',
          query,
          result: {
            query,
            rows: result.data.items.map((item) =>
              this.registeredSources().has(item.sourceId) ? { ...item, isImported: true } : item,
            ),
            total: result.data.totalCount,
            hasNextPage: (query.pageIndex + 1) * query.pageSize < result.data.totalCount,
          },
        }
      : { kind: result.kind, query };
  });
  readonly candidateFailure = computed(() => {
    const error = this.candidatesRead.error();
    return error === undefined ? null : globalTemplateError(error);
  });
  readonly form = new FormGroup({
    file: new FormControl<File | null>(null, {
      validators: [
        (control) => {
          const value: unknown = control.value;
          const error = globalTemplateFileError(value);
          return error ? { [error]: true } : null;
        },
      ],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)],
    }),
  });
  readonly draftRevision = signal(0);
  private sequence = 0;

  constructor() {
    effect(() => {
      const detail = this.detail();
      if (detail) this.access.select(detail);
      else if (!this.detailOpen()) this.access.clear();
    });
    this.form.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.draftRevision.update((revision) => revision + 1);
      this.inspection.set(null);
      this.replacementTarget.set(null);
    });
    effect(() => {
      this.identity();
      this.columnFilters.set([]);
      this.editor.set(null);
      this.selected.set(null);
      this.candidatesOpen.set(false);
      this.registeredSources.set(new Set());
      this.feedback.set(null);
      this.commandPending.set(false);
      this.archiveTarget.set(null);
      this.replacementTarget.set(null);
      this.form.reset();
    });
    const unregister = this.unsaved.register({
      read: () => ({
        identity: 'global-template-' + (this.editor()?.revision ?? 0),
        revision: this.draftRevision() + this.access.draftRevision(),
        active: this.editorOpen() || this.detailOpen(),
        unsaved: this.form.dirty || this.access.dirty(),
        pending: this.pending(),
      }),
      invalidate: () => {
        this.closeEditor();
        this.access.clear();
        this.selected.set(null);
      },
    });
    this.destroyRef.onDestroy(unregister);
  }

  can(action: GlobalTemplateAction): boolean {
    const entity = this.entity();
    return !!entity && globalTemplateAllowed(this.identity(), entity, action);
  }
  canVersion(action: 'Upload' | 'Publish' | 'Download'): boolean {
    const detail = this.detail();
    return !!detail && !detail.isArchived && this.can(action) && this.access.has(action);
  }
  canAt(entity: GlobalTemplateEntity, action: GlobalTemplateAction): boolean {
    return globalTemplateAllowed(this.identity(), entity, action);
  }
  canAny(action: GlobalTemplateAction): boolean {
    return this.contracts().some((contract) => this.canAt(contract.entityKey, action));
  }
  async selectEntity(value: string): Promise<void> {
    const entity =
      value === '' ? '' : this.contracts().find((item) => item.entityKey === value)?.entityKey;
    if (entity === undefined || entity === this.filterEntity() || this.pending()) return;
    if (!(await this.unsaved.request('global-template:entity'))) return;
    this.closeEditor();
    this.selected.set(null);
    this.candidatesOpen.set(false);
    this.criteria.set({ ...this.criteria(), pageIndex: 0 });
    this.requestedEntity.set(entity);
  }
  search(value: string): void {
    if (value.length <= 200) this.criteria.set({ ...this.criteria(), search: value, pageIndex: 0 });
  }
  filterStatus(status: string): void {
    if (status === '' || status === 'published' || status === 'draft' || status === 'archived')
      this.criteria.set({ ...this.criteria(), status, pageIndex: 0 });
  }
  page(pageIndex: number, pageSize: number): void {
    this.criteria.set({ ...this.criteria(), pageIndex, pageSize });
  }
  changeColumnFilters(value: unknown): void {
    this.columnFilters.set(parseGlobalTemplateFilters(value));
    this.criteria.update((criteria) => ({ ...criteria, pageIndex: 0 }));
  }
  reload(): void {
    this.feedback.set(null);
    this.entitiesRead.invalidate();
    this.refresh.update((value) => value + 1);
  }
  openDetail(row: GlobalTemplateRow): void {
    const actor = this.identity();
    if (
      actor &&
      (this.filterEntity() === '' || this.filterEntity() === row.entityKey) &&
      this.canAt(row.entityKey, 'View') &&
      !this.pending()
    )
      this.selected.set({ actor, entity: row.entityKey, id: row.id });
  }
  closeDetail(): void {
    if (!this.pending()) {
      this.selected.set(null);
      this.access.clear();
    }
  }
  showCreatedDraft(detail: GlobalTemplateDetail): void {
    const actor = this.identity();
    if (!actor || !this.canAt(detail.entityKey, 'View')) return;
    this.requestedEntity.set(detail.entityKey);
    this.criteria.set({ ...this.criteria(), status: '', pageIndex: 0 });
    this.refresh.update((value) => value + 1);
    this.selected.set({ actor, entity: detail.entityKey, id: detail.id });
    this.notices.success('globalTemplates.design.created', 'reporting');
  }
  designerPackage(): void {
    const detail = this.detail();
    if (detail && this.canAt(detail.entityKey, 'Download'))
      this.run(this.service.designerPackage(detail.entityKey), (blob) =>
        downloadBlob(blob, detail.entityKey + '-designer.zip'),
      );
  }
  openEditor(report: GlobalTemplateDetail | null): void {
    const actor = this.identity(),
      entity =
        report?.entityKey ??
        this.contracts().find(
          (contract) =>
            this.canAt(contract.entityKey, 'Create') &&
            (!this.filterEntity() || this.filterEntity() === contract.entityKey),
        )?.entityKey;
    if (
      !actor ||
      !entity ||
      !this.canAt(entity, report ? 'Upload' : 'Create') ||
      this.pending() ||
      (report && (report.isArchived || !this.access.has('Upload') || this.access.dirty()))
    )
      return;
    this.form.reset();
    this.feedback.set(null);
    this.inspection.set(null);
    this.editor.set({ actor, entity, reportId: report?.id ?? null, revision: ++this.sequence });
  }
  selectEditorEntity(value: string): void {
    const editor = this.editor();
    const entity = this.contracts().find((item) => item.entityKey === value)?.entityKey;
    if (
      !editor ||
      editor.reportId ||
      !entity ||
      this.pending() ||
      !globalTemplateAllowed(this.identity(), entity, 'Create')
    )
      return;
    this.selected.set(null);
    this.replacementTarget.set(null);
    this.editor.set({ ...editor, entity });
    this.form.markAsDirty();
    this.draftRevision.update((revision) => revision + 1);
    this.inspection.set(null);
  }
  closeEditor(): void {
    this.replacementTarget.set(null);
    this.editor.set(null);
    this.form.reset();
    this.inspection.set(null);
  }
  save(): void {
    const editor = this.editor(),
      file = this.form.controls.file.value;
    if (
      !editor ||
      !this.editorOpen() ||
      !file ||
      this.form.invalid ||
      !this.can(editor.reportId ? 'Upload' : 'Create')
    )
      return;
    const description = this.form.controls.description.value;
    const revision = this.draftRevision();
    const upload = () =>
      this.service
        .upload(editor.entity, file, description, editor.reportId)
        .pipe(map((detail): SaveOutcome => ({ kind: 'saved', detail })));
    const request = editor.reportId
      ? upload()
      : this.service.uploadTarget(editor.entity, file.name).pipe(
          switchMap((target): Observable<SaveOutcome> => {
            if (
              this.editor() !== editor ||
              this.form.controls.file.value !== file ||
              this.draftRevision() !== revision
            )
              return EMPTY;
            return target.report ? of<SaveOutcome>({ kind: 'duplicate', target }) : upload();
          }),
        );
    this.run(request, (outcome) => {
      if (
        this.editor() !== editor ||
        this.form.controls.file.value !== file ||
        this.draftRevision() !== revision
      )
        return;
      if (outcome.kind === 'saved') {
        this.finishSave(
          outcome.detail,
          editor,
          editor.reportId ? 'crystalReports.versionUploaded' : 'crystalReports.created',
        );
        return;
      }
      const report = outcome.target.report;
      if (
        !report ||
        !outcome.target.canReplace ||
        report.isArchived ||
        !this.can('Upload') ||
        !this.can('Publish')
      ) {
        this.feedback.set({
          key: 'globalTemplates.replacementUnavailable',
          message: '',
          fields: {},
        });
        return;
      }
      this.replacementTarget.set({ editor, file, draftRevision: revision, report });
    });
  }
  cancelReplacement(): void {
    if (!this.pending()) this.replacementTarget.set(null);
  }
  confirmReplacement(): void {
    const target = this.replacementTarget();
    if (
      !target ||
      this.editor() !== target.editor ||
      !this.editorOpen() ||
      target.editor.actor !== this.identity() ||
      this.form.controls.file.value !== target.file ||
      this.draftRevision() !== target.draftRevision ||
      !this.can('Upload') ||
      !this.can('Publish')
    )
      return;
    this.run(
      this.service.replace(
        target.report.id,
        target.editor.entity,
        target.file,
        target.report.rowVersion,
      ),
      (detail) => this.finishSave(detail, target.editor, 'globalTemplates.replacedAndPublished'),
    );
  }
  private finishSave(
    detail: GlobalTemplateDetail,
    editor: GlobalTemplateEditorContext,
    message: string,
  ): void {
    this.closeEditor();
    this.selected.set({ actor: editor.actor, entity: editor.entity, id: detail.id });
    this.refresh.update((value) => value + 1);
    this.notices.success(message, 'reporting');
  }
  inspect(): void {
    const editor = this.editor(),
      file = this.form.controls.file.value;
    if (
      !editor ||
      !this.editorOpen() ||
      !file ||
      globalTemplateFileError(file) ||
      !this.can('Upload')
    )
      return;
    this.run(this.service.inspect(editor.entity, file), (result) => {
      if (this.editor() === editor && this.form.controls.file.value === file)
        this.inspection.set({ valid: result.isValid, reason: result.validationReason });
    });
  }
  publish(version: GlobalTemplateVersion): void {
    const detail = this.detail(),
      contract = this.contracts().find((item) => item.entityKey === this.entity());
    if (
      !detail ||
      detail.isArchived ||
      this.access.dirty() ||
      !this.access.has('Publish') ||
      !this.can('Publish') ||
      version.isPublished ||
      version.validationStatus !== 'Valid' ||
      version.validationContractFingerprint !== contract?.contractFingerprint
    )
      return;
    this.run(
      this.service.publish(
        detail.id,
        version.id,
        this.access.snapshot()?.rowVersion ?? detail.rowVersion,
      ),
      () => {
        this.refresh.update((value) => value + 1);
        this.notices.success('crystalReports.published', 'reporting');
      },
    );
  }
  publishable(version: GlobalTemplateVersion): boolean {
    const contract = this.contracts().find((item) => item.entityKey === this.entity());
    return (
      !version.isPublished &&
      version.validationStatus === 'Valid' &&
      version.validationContractFingerprint === contract?.contractFingerprint
    );
  }
  validationStatus(version: GlobalTemplateVersion): GlobalTemplateVersion['validationStatus'] {
    const contract = this.contracts().find((item) => item.entityKey === this.entity());
    return version.validationStatus === 'Valid' &&
      version.validationContractFingerprint !== contract?.contractFingerprint
      ? 'NeedsRevalidation'
      : version.validationStatus;
  }
  revalidate(version: GlobalTemplateVersion): void {
    const detail = this.detail();
    if (
      detail &&
      !detail.isArchived &&
      !this.access.dirty() &&
      this.can('Upload') &&
      this.access.has('Upload')
    )
      this.run(this.service.revalidate(detail.id, version.id), () => {
        this.refresh.update((value) => value + 1);
        this.notices.success('globalTemplates.revalidationCompleted', 'reporting');
      });
  }
  download(version: GlobalTemplateVersion): void {
    const detail = this.detail();
    if (detail && !detail.isArchived && this.can('Download') && this.access.has('Download'))
      this.run(this.service.download(detail.id, version.id), (blob) =>
        downloadBlob(blob, version.originalFileName),
      );
  }
  downloadPublished(row: GlobalTemplateRow): void {
    if (
      !this.canAt(row.entityKey, 'Download') ||
      row.isArchived ||
      !row.isPublished ||
      (this.filterEntity() && row.entityKey !== this.filterEntity())
    )
      return;
    let fileName = '';
    this.run(
      this.service.detail(row.id).pipe(
        switchMap((detail) => {
          const version = detail.versions.find((item) => item.isPublished);
          if (!version || detail.entityKey !== row.entityKey)
            return throwError(() => new Error('Published source unavailable'));
          fileName = version.originalFileName;
          return this.service.download(detail.id, version.id);
        }),
      ),
      (blob) => downloadBlob(blob, fileName),
    );
  }
  schema(): void {
    const entity = this.filterEntity();
    if (entity && this.can('Download'))
      this.run(this.service.schema(entity), (blob) => downloadBlob(blob, entity + '.xsd'));
  }
  requestArchive(row: GlobalTemplateRow): void {
    if (
      !this.pending() &&
      this.canAt(row.entityKey, 'Archive') &&
      (!this.filterEntity() || row.entityKey === this.filterEntity()) &&
      !row.isArchived
    )
      this.archiveTarget.set(row);
  }
  cancelArchive(): void {
    if (!this.pending()) this.archiveTarget.set(null);
  }
  archive(): void {
    const target = this.archiveTarget();
    if (
      !target ||
      !this.canAt(target.entityKey, 'Archive') ||
      (this.filterEntity() && target.entityKey !== this.filterEntity())
    )
      return;
    this.run(this.service.archive(target.id, target.rowVersion), () => {
      this.archiveTarget.set(null);
      this.notices.success('crystalReports.archiveSuccess', 'reporting');
      this.refresh.update((value) => value + 1);
    });
  }
  loadCandidates(): void {
    const entity = this.contracts().find(
      (contract) =>
        this.canAt(contract.entityKey, 'Create') &&
        (!this.filterEntity() || this.filterEntity() === contract.entityKey),
    )?.entityKey;
    if (entity && !this.pending() && !this.access.dirty()) {
      this.selected.set(null);
      this.candidateEntity.set(entity);
      this.candidateCriteria.set({ search: '', pageIndex: 0, pageSize: 10 });
      this.feedback.set(null);
      this.candidatesOpen.set(true);
    }
  }
  closeCandidates(): void {
    if (!this.pending()) this.candidatesOpen.set(false);
  }
  selectCandidateEntity(value: string): void {
    const entity = this.contracts().find((contract) => contract.entityKey === value)?.entityKey;
    if (!entity || !this.canAt(entity, 'Create') || this.pending()) return;
    this.candidateEntity.set(entity);
    this.candidateCriteria.set({ search: '', pageIndex: 0, pageSize: 10 });
    this.feedback.set(null);
  }
  refreshCandidates(): void {
    this.candidateRevision.update((value) => value + 1);
  }
  searchCandidates(search: string): void {
    if (search.length <= 200)
      this.candidateCriteria.set({ ...this.candidateCriteria(), search, pageIndex: 0 });
  }
  pageCandidates(pageIndex: number, pageSize: number): void {
    this.candidateCriteria.set({ ...this.candidateCriteria(), pageIndex, pageSize });
  }
  import(candidate: GlobalTemplateCandidate): void {
    if (!this.canRegister(candidate)) return;
    this.run(this.service.import(candidate.entityKey, candidate.sourceId, candidate.sha256), () => {
      this.registeredSources.update((current) => new Set([...current, candidate.sourceId]));
      this.refreshCandidates();
      this.refresh.update((value) => value + 1);
      this.notices.success('crystalReports.importSuccess', 'reporting');
    });
  }
  canRegister(candidate: GlobalTemplateCandidate): boolean {
    return (
      this.can('Create') &&
      candidate.entityKey === this.entity() &&
      !candidate.isImported &&
      !this.registeredSources().has(candidate.sourceId) &&
      candidate.isImportable &&
      /^[a-f0-9]{64}$/.test(candidate.sha256)
    );
  }
  private run<T>(request: Observable<T>, success: (value: T) => void): void {
    const actor = this.identity(),
      entity = this.entity();
    if (!actor || !entity || this.pending()) return;
    this.commandPending.set(true);
    this.feedback.set(null);
    request
      .pipe(
        takeUntil(this.identityChanges.pipe(filter((current) => current !== actor))),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          if (this.identity() === actor) this.commandPending.set(false);
        }),
      )
      .subscribe({
        next: (value) => {
          if (this.identity() === actor && this.entity() === entity) success(value);
        },
        error: (error: unknown) => {
          if (this.identity() !== actor || this.entity() !== entity) return;
          this.replacementTarget.set(null);
          const feedback = globalTemplateError(error);
          this.feedback.set(feedback);
          applyServerFieldErrors(this.form, feedback.fields);
          if (feedback.key === 'globalTemplates.conflict') {
            this.refresh.update((value) => value + 1);
            this.refreshCandidates();
          }
        },
      });
  }
}
