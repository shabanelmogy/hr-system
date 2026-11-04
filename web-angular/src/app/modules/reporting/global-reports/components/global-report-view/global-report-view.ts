import {
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import { AuthSession, type Session } from '../../../../../platform/auth/session.public-api';
import {
  ActionButton,
  AppIcon,
  FeedbackState,
  FormContainer,
  PageHeader,
  OptionSelect,
  PdfViewer,
  ReferenceField,
  ReportWorkspace,
  TextField,
  applyServerFieldErrors,
  type ReferenceSource,
} from '../../../../../shared/ui/public-api';
import { GlobalReportState } from '../../state/global-report-state';
import { reportFilterValidator } from '../../validation/report-filter-validator';
import {
  emptyReportFilters,
  reportFilterLimit,
  globalReportAllowed,
  globalReportEntities,
  type GlobalReportEntity,
} from '../../types/global-report';
@Component({
  selector: 'erp-global-report-view',
  host: { '[class.embedded]': 'embedded()' },
  providers: [GlobalReportState],
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet,
    ActionButton,
    AppIcon,
    FeedbackState,
    FormContainer,
    PageHeader,
    OptionSelect,
    PdfViewer,
    ReferenceField,
    ReportWorkspace,
    TextField,
    UiTextPipe,
  ],
  templateUrl: './global-report-view.html',
  styleUrl: './global-report-view.scss',
})
export class GlobalReportView {
  readonly entity = model<GlobalReportEntity>('countries');
  readonly chooseEntity = input(false);
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
  readonly entityOptions = computed(() =>
    globalReportEntities
      .filter((entity) => globalReportAllowed(this.auth.readIdentity(), entity))
      .map((value) => ({
        value,
        label: this.locale.translate('globalTemplates.entities.' + value, 'reporting'),
      })),
  );
  readonly limit = reportFilterLimit;
  readonly form = new FormGroup({
    nameAr: new FormControl('', { nonNullable: true, validators: reportFilterValidator }),
    nameEn: new FormControl('', { nonNullable: true, validators: reportFilterValidator }),
  });
  readonly report = new FormControl<string | number | null>(null);
  private readonly criteriaForm = viewChild<FormContainer>('criteriaForm');
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
    return 'countries-' + (report?.id.slice(0, 16) ?? 'report') + '.pdf';
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
      this.state.setEntity(selected);
    });
    void this.locale.loadNamespace('core');
    effect(() => {
      const actor = this.auth.readIdentity();
      if (this.draftActor !== undefined && this.draftActor !== actor)
        this.form.reset(emptyReportFilters);
      this.draftActor = actor;
    });
    effect(() => {
      this.report.setValue(this.state.selected()?.id ?? null, { emitEvent: false });
    });
    this.report.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.state.select(value));
    effect(() => {
      const view = this.state.view();
      if (view.kind === 'error' && view.failure.kind === 'validation') {
        applyServerFieldErrors(this.form, view.failure.fields);
        this.sidebarTab.set('criteria');
        this.criteriaForm()?.revealErrors();
      }
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
    this.state.search(this.form.getRawValue());
  }
  reload(): void {
    this.state.reload();
  }
  reset() {
    this.form.reset(emptyReportFilters);
    this.state.reset();
  }
  retry() {
    if (this.state.catalog().kind === 'error') this.state.reload();
    else this.state.search(this.state.applied());
  }
}
