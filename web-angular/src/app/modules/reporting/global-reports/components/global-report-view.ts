import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { form, FormField, submit, validate, metadata, MAX_LENGTH } from '@angular/forms/signals';
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
  mapServerFieldErrors,
  type ReferenceSource,
} from '../../../../shared/ui/public-api';
import { GlobalReportState } from '../state/global-report-state';
import { reportFilterErrors } from '../validation/report-filter-validator';
import { emptyReportFilters, reportFilterLimit } from '../types/global-report';
@Component({
  selector: 'erp-global-report-view',
  host:{'[class.embedded]':'embedded()'},
  providers: [GlobalReportState],
  imports: [
    FormField,
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
  templateUrl: './global-report-view.html',
  styleUrl: './global-report-view.scss',
})
export class GlobalReportView {
  readonly embedded=input(false);
  readonly showFilterBar=input(true);
  readonly catalogErrorMessage=input('');readonly unavailableMessage=input('');
  readonly state = inject(GlobalReportState);
  readonly locale = inject(LocalizationRuntime);
  private readonly auth = inject(AuthSession);
  readonly limit = reportFilterLimit;
  readonly form = form(signal({ ...emptyReportFilters }), path => {
    for (const field of ['nameAr', 'nameEn'] as const) {
      metadata(path[field], MAX_LENGTH, () => reportFilterLimit);
      validate(path[field], ({ value }) => reportFilterErrors(value()));
    }
  }, {submission:{ignoreValidators:'none',action:async field=>{
    const submitted=field().value(),actor=this.auth.readIdentity();
    const failure=await this.state.submitSearch(submitted);
    if(actor===this.auth.readIdentity()&&failure?.kind==='validation')return mapServerFieldErrors(field,failure.fields,submitted);
    return;
  }}});
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
      if(this.draftActor!==undefined&&this.draftActor!==actor)this.form().reset({ ...emptyReportFilters });
      this.draftActor=actor;
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
    return submit(this.form);
  }
  reload():void{this.state.reload();}
  reset() {
    this.form().reset({ ...emptyReportFilters });
    this.state.reset();
  }
  retry() {
    if (this.state.catalog().kind === 'error') this.state.reload();
    else this.state.search(this.state.applied());
  }
}
