import {
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { DialogPanel, FeedbackState } from '../../../../../shared/ui/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';
import { GlobalTemplateAccessState } from '../../state/global-template-access-state';
import {
  globalTemplateAllowed,
  type GlobalTemplateViewerSource,
} from '../../types/global-template';
import { GlobalTemplateDetailDialog } from '../global-template-detail-dialog/global-template-detail-dialog';
import { GlobalTemplateUploadDialog } from '../global-template-upload-dialog/global-template-upload-dialog';

@Component({
  imports: [
    DialogPanel,
    FeedbackState,
    UiTextPipe,
    GlobalTemplateDetailDialog,
    GlobalTemplateUploadDialog,
  ],
  providers: [GlobalTemplateState, GlobalTemplateAccessState],
  selector: 'erp-global-report-template-editor',
  templateUrl: './global-report-template-editor.html',
})
export class GlobalReportTemplateEditor {
  readonly report = input.required<GlobalTemplateViewerSource>();
  readonly closed = output<void>();
  readonly state = inject(GlobalTemplateState);
  private readonly locale = inject(LocalizationRuntime);
  private readonly requested = signal(false);
  private openedDetail = false;
  readonly failure = computed(() => {
    if (!globalTemplateAllowed(this.state.identity(), this.report().entityKey, 'Upload'))
      return 'authorization.forbidden.title';
    if (this.state.entities().kind === 'error') return 'common.error';
    if (
      this.state.entities().kind === 'ready' &&
      !this.state.contracts().some((contract) => contract.entityKey === this.report().entityKey)
    )
      return 'authorization.forbidden.title';
    return this.state.editorOpen() ? '' : (this.state.feedback()?.key ?? '');
  });
  constructor() {
    void this.locale.loadNamespace('reporting');
    effect(() => {
      if (!this.requested() && !this.failure() && this.state.entities().kind === 'ready') {
        const report = this.report();
        untracked(() => {
          this.requested.set(true);
          this.state.openViewerTemplate(report);
        });
      }
    });
    effect(() => {
      if (this.state.detailOpen()) this.openedDetail = true;
      else if (this.openedDetail) this.closed.emit();
    });
  }
}
