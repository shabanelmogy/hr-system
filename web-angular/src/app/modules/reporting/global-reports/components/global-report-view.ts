import { Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocalizationRuntime, UiTextPipe } from '../../../../platform/localization/public-api';
import { AuthSession,type Session } from '../../../../platform/auth/session.public-api';
import {
  ActionButton,
  FeedbackState,
  FormContainer,
  PageHeader,
  PdfViewer,
  ReferenceField,
  ReportWorkspace,
  TextField,
  applyServerFieldErrors,
  type ReferenceSource,
} from '../../../../shared/ui/public-api';
import { GlobalReportState } from '../state/global-report-state';
import { reportFilterValidator } from '../validation/report-filter-validator';
import { emptyReportFilters, reportFilterLimit } from '../types/global-report';
@Component({
  selector: 'erp-global-report-view',
  host:{'[class.embedded]':'embedded()'},
  providers: [GlobalReportState],
  imports: [
    ReactiveFormsModule,
    ActionButton,
    FeedbackState,
    FormContainer,
    PageHeader,
    PdfViewer,
    ReferenceField,
    ReportWorkspace,
    TextField,
    UiTextPipe,
  ],
  template: ` <main [class.embedded]="embedded()">
    @if(!embedded()){
    <erp-page-header [title]="'reports.reportViewer' | uiText"
      ><div class="actions">
        <erp-button
          data-testid="language"
          [label]="(locale.language() === 'en' ? 'common.arabic' : 'common.english') | uiText"
          (activated)="locale.setLanguage(locale.language() === 'en' ? 'ar' : 'en')"
        />
        <erp-button
          data-testid="reload"
          [label]="'actions.refresh' | uiText"
          (activated)="state.reload()"
        /></div
    ></erp-page-header>}
    @if (state.view().kind === 'forbidden') {
      <erp-feedback-state kind="forbidden" [title]="'authorization.forbidden.title' | uiText" />
    } @else {
      <erp-report-workspace
        [label]="'reports.reportViewer' | uiText"
        [criteriaLabel]="'reports.searchOptions' | uiText"
        [appearance]="embedded()?'reference':'default'"
        [criteriaVisible]="showFilterBar() && state.catalog().kind === 'ready' && state.selected() !== null"
      >
        <div reportCriteria>
          <erp-form
            #criteriaForm
            data-testid="criteria"
            [form]="form"
            [title]="'reports.searchOptions' | uiText"
            [submitLabel]="'reports.searchUpper' | uiText"
            [appearance]="embedded()?'sidebar':'card'" [hideHeader]="embedded()" [submitFullWidth]="embedded()"
            [pending]="state.pending()"
            [readOnly]="state.conflict()"
            (validSubmit)="search()"
          >
            <erp-text-field
              data-testid="nameAr"
              [formControl]="form.controls.nameAr"
              [label]="'general.nameAr' | uiText"
              [maxLength]="limit"
              [messages]="messages()"
            />
            <erp-text-field
              data-testid="nameEn"
              [formControl]="form.controls.nameEn"
              [label]="'general.nameEn' | uiText"
              [maxLength]="limit"
              [messages]="messages()"
            />
            <erp-reference-field data-testid="report" [formControl]="report" [source]="source()"
              [label]="'reports.reportForms'|uiText" [searchable]="false" [clearable]="false" />
            <erp-button
              formActions
              data-testid="reset"
              [label]="'reports.clearFilters' | uiText"
              variant="outlined" [fullWidth]="embedded()"
              [disabled]="state.pending() || state.conflict()"
              (activated)="reset()"
            />
          </erp-form>
        </div>
        <div reportDocument data-testid="document" [class.contained-document]="embedded()">
          @switch (state.view().kind) {
            @case ('loading') {
              <erp-feedback-state kind="loading" [title]="'reports.generatingReport' | uiText" />
            }
            @case ('empty') {
              <erp-feedback-state kind="empty" [title]="unavailableMessage() || ('reports.noResultsFound' | uiText)" [actionLabel]="'actions.retry'|uiText" (action)="state.reload()" />
            }
            @case ('conflict') {
              <erp-feedback-state
                kind="error"
                [title]="'reports.sourceChanged' | uiText"
                [actionLabel]="'actions.refresh' | uiText"
                (action)="state.reload()"
              />
            }
            @case ('error') {
              <erp-feedback-state
                kind="error"
                [title]="errorCaption()"
                [actionLabel]="'actions.retry' | uiText"
                (action)="retry()"
              />
            }
            @case ('ready') {
              @if (document(); as pdf) {
                <erp-pdf-viewer
                  [document]="pdf"
                  [title]="'reports.reportViewer' | uiText"
                  [downloadName]="fileName()"
                  [fill]="embedded()"
                />
              }
            }
          }</div
      ></erp-report-workspace>
    }
  </main>`,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    main {
      padding: 24px;
      max-width: 1600px;
      margin: auto;
      min-width: 0;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    erp-pdf-viewer {
      display: block;
    }
    @media (max-width: 600px) {
      main {
        padding: 12px;
      }
    }
    :host.embedded{height:100%;min-height:0}main.embedded{height:100%;min-height:0;padding:0;max-width:none;display:flex;flex-direction:column;box-sizing:border-box}main.embedded erp-report-workspace{flex:1;min-height:0}.contained-document{height:100%;min-height:0}.contained-document erp-feedback-state{height:100%;display:grid;align-items:center}
  `,
})
export class GlobalReportView {
  readonly embedded=input(false);
  readonly showFilterBar=input(true);
  readonly catalogErrorMessage=input('');readonly unavailableMessage=input('');
  readonly state = inject(GlobalReportState);
  readonly locale = inject(LocalizationRuntime);
  private readonly auth = inject(AuthSession);
  readonly limit = reportFilterLimit;
  readonly form = new FormGroup({
    nameAr: new FormControl('', { nonNullable: true, validators: reportFilterValidator }),
    nameEn: new FormControl('', { nonNullable: true, validators: reportFilterValidator }),
  });
  readonly report = new FormControl<string | number | null>(null);
  private readonly criteriaForm=viewChild<FormContainer>('criteriaForm');
  private draftActor:Session|null|undefined;
  readonly source = computed<ReferenceSource>(() => {
    const actor = this.auth.readIdentity(),
      catalog = this.state.catalog(),
      query = {
        scopeKey: JSON.stringify([
          actor?.userId,
          actor?.tenantId,
          actor?.companyId,
          'global-countries',
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
    void this.locale.loadNamespace('core');
    effect(() => {
      const actor=this.auth.readIdentity();
      if(this.draftActor!==undefined&&this.draftActor!==actor)this.form.reset(emptyReportFilters);
      this.draftActor=actor;
    });
    effect(() => {
      this.report.setValue(this.state.selected()?.id ?? null, { emitEvent: false });
    });
    this.report.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((value) => this.state.select(value));
    effect(() => {
      const view = this.state.view();
      if (view.kind === 'error' && view.failure.kind === 'validation'){
        applyServerFieldErrors(this.form, view.failure.fields);
        this.criteriaForm()?.revealErrors();
      }
    });
  }
  errorCaption() {
    const view = this.state.view();
    if(this.state.catalog().kind==='error'&&this.catalogErrorMessage())return this.catalogErrorMessage();
    return this.locale.translate(
      view.kind === 'error' && view.failure.kind === 'invalidPdf'
        ? 'reports.invalidPdf'
        : 'common.error',
    );
  }
  search() {
    this.state.search(this.form.getRawValue());
  }
  reload():void{this.state.reload();}
  reset() {
    this.form.reset(emptyReportFilters);
    this.state.reset();
  }
  retry() {
    if (this.state.catalog().kind === 'error') this.state.reload();
    else this.state.search(this.state.applied());
  }
}
