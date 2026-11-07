import {
  Component,
  computed,
  effect,
  inject,
  input,
  linkedSignal,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { form, submit, validate, metadata, MAX_LENGTH } from '@angular/forms/signals';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import {
  ActionButton,
  AppIcon,
  FeedbackState,
  PageHeader,
  PdfViewer,
  ReportWorkspace,
  mapServerFieldErrors,
  type ReferenceSource,
} from '../../../../../shared/ui/public-api';
import { GlobalReportState } from '../../state/global-report-state';
import { GlobalReportCriteria } from '../global-report-criteria/global-report-criteria';
import { GlobalReportTemplateEditor } from '../../../global-template-manager/report-editor.public-api';
import { globalTemplateAllowed } from '../../../global-template-manager/policy.public-api';
import { reportFilterErrors } from '../../validation/report-filter-validator';
import {
  emptyReportFilterForm,
  reportFilterLimit,
  globalReportAllowed,
  globalReportEntities,
  type GlobalReportEntity,
  type GlobalReport,
  type ReportFilterForm,
  type ReportFilters,
} from '../../types/global-report';
@Component({
  selector: 'erp-global-report-view',
  host: { '[class.embedded]': 'embedded()' },
  providers: [GlobalReportState],
  imports: [
    GlobalReportCriteria,
    GlobalReportTemplateEditor,
    NgTemplateOutlet,
    ActionButton,
    AppIcon,
    FeedbackState,
    PageHeader,
    PdfViewer,
    ReportWorkspace,
    UiTextPipe,
  ],
  templateUrl: './global-report-view.html',
  styleUrl: './global-report-view.scss',
})
export class GlobalReportView {
  readonly entity = model<GlobalReportEntity>('countries');
  readonly chooseEntity = input(false);
  readonly externalCriteria = input<ReportFilters>();
  readonly embedded = input(false);
  readonly showFilterBar = input(true);
  readonly catalogErrorMessage = input('');
  readonly unavailableMessage = input('');
  readonly state = inject(GlobalReportState);
  readonly pdfViewer = viewChild(PdfViewer);
  readonly sidebarTab = signal('criteria');
  readonly criteriaVisible = computed(
    () =>
      this.showFilterBar() &&
      (this.chooseEntity() ||
        (this.state.catalog().kind === 'ready' && this.state.selected() !== null)),
  );
  readonly locale = inject(LocalizationRuntime);
  private readonly auth = inject(AuthSession);
  readonly templateEditor = linkedSignal<GlobalReport | null>(() => {
    this.auth.readIdentity();
    this.state.selected();
    return null;
  });
  readonly canUploadSource = computed(() => {
    const report = this.state.selected();
    return (
      !!report &&
      globalTemplateAllowed(this.auth.readIdentity(), report.entityKey, 'View') &&
      globalTemplateAllowed(this.auth.readIdentity(), report.entityKey, 'Upload')
    );
  });
  closeTemplateEditor(): void {
    this.templateEditor.set(null);
    this.state.reload();
  }
  readonly entityOptions = computed(() =>
    globalReportEntities
      .filter((entity) => globalReportAllowed(this.auth.readIdentity(), entity))
      .map((value) => ({
        value,
        label: this.locale.translate('globalTemplates.entities.' + value, 'reporting'),
      })),
  );
  readonly limit = reportFilterLimit;
  readonly form = form(
    signal<ReportFilterForm>({ ...emptyReportFilterForm }),
    (path) => {
      for (const field of ['nameAr', 'nameEn', 'stateAr', 'stateEn'] as const) {
        metadata(path[field], MAX_LENGTH, () => reportFilterLimit);
        validate(path[field], ({ value }) => reportFilterErrors(value()));
      }
    },
    {
      submission: {
        ignoreValidators: 'none',
        action: async (field) => {
          const submitted = field().value(),
            actor = this.auth.readIdentity();
          const failure = await this.state.submitSearch(submitted);
          if (actor === this.auth.readIdentity() && failure?.kind === 'validation') {
            this.sidebarTab.set('criteria');
            return mapServerFieldErrors(field, this.mapServerFields(failure.fields), submitted);
          }
          return;
        },
      },
    },
  );
  private draftActor: Session | null | undefined;
  readonly source = computed<ReferenceSource>(() => {
    const actor = this.auth.readIdentity(),
      catalog = this.state.catalog(),
      query = {
        scopeKey: JSON.stringify([
          actor?.userId,
          actor?.tenantId,
          actor?.companyId,
          'global-' + this.entity(),
        ]),
        search: '',
      };
    if (catalog.kind !== 'ready') return { query, kind: catalog.kind };
    return {
      query,
      kind: 'ready',
      result: {
        query,
        hasMore: false,
        options: catalog.data.map((report) => ({
          value: report.id,
          label:
            (this.locale.language() === 'ar' ? report.summaryTitle : report.summarySubject) ||
            report.displayName,
        })),
      },
    };
  });
  readonly document = computed(() => {
    const view = this.state.view();
    return view.kind === 'ready' ? view.document : null;
  });
  readonly fileName = computed(() => {
    const report = this.state.selected();
    return this.entity() + '-' + (report?.id.slice(0, 16) ?? 'report') + '.pdf';
  });
  readonly messages = computed(() => ({
    maxlength: this.locale.translate('validation.maxLength', 'core', { count: this.limit }),
  }));
  constructor() {
    void this.locale.loadNamespace('reporting');
    effect(() => {
      const current = this.entity(),
        options = this.entityOptions();
      const selected =
        this.chooseEntity() && !options.some((option) => option.value === current)
          ? (options[0]?.value ?? current)
          : current;
      if (selected !== current) this.entity.set(selected);
      if (this.state.entity() !== selected) this.form().reset(emptyReportFilterForm);
      this.state.setEntity(selected);
    });
    effect(() => {
      const criteria = this.externalCriteria();
      this.entity();
      if (criteria) this.state.setExternalCriteria(criteria);
    });
    void this.locale.loadNamespace('core');
    effect(() => {
      if (this.entity() === 'districts') void this.locale.loadNamespace('reference-districts');
    });
    effect(() => {
      const actor = this.auth.readIdentity();
      if (this.draftActor !== undefined && this.draftActor !== actor)
        this.form().reset(emptyReportFilterForm);
      this.draftActor = actor;
    });
  }
  selectEntity(value: string): void {
    const entity = globalReportEntities.find((entity) => entity === value);
    if (entity && this.entityOptions().some((option) => option.value === entity))
      this.entity.set(entity);
  }
  errorCaption() {
    const view = this.state.view();
    if (this.state.catalog().kind === 'error' && this.catalogErrorMessage())
      return this.catalogErrorMessage();
    if (view.kind === 'error' && view.failure.kind === 'template' && view.failure.publicMessage)
      return view.failure.publicMessage;
    return this.locale.translate(
      view.kind === 'error' && view.failure.kind === 'invalidPdf'
        ? 'reports.invalidPdf'
        : 'common.error',
    );
  }
  search() {
    return submit(this.form);
  }
  reload(): void {
    this.state.reload();
  }
  reset() {
    this.form().reset(emptyReportFilterForm);
    this.state.reset();
  }
  private mapServerFields(
    fields: Readonly<Record<string, string>>,
  ): Readonly<Record<string, string>> {
    const aliases: Readonly<Record<string, keyof ReportFilterForm>> = {
      NameAr: 'nameAr',
      NameEn: 'nameEn',
      StateAr: 'stateAr',
      StateEn: 'stateEn',
    };
    const mapped: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      const field = aliases[key] ?? (key as keyof ReportFilterForm);
      if (field === 'stateAr' || field === 'stateEn') {
        if (this.entity() !== 'districts') continue;
      }
      mapped[field] = value;
    }
    return mapped;
  }
  retry() {
    if (this.state.catalog().kind === 'error') this.state.reload();
    else this.state.search(this.state.applied());
  }
}
