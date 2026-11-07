import { Component, inject } from '@angular/core';
import { LocalizationRuntime } from '../../../../../platform/localization/public-api';
import { GlobalTemplateConfirmations } from '../../components/global-template-confirmations/global-template-confirmations';
import { GlobalTemplateDetailDialog } from '../../components/global-template-detail-dialog/global-template-detail-dialog';
import { GlobalTemplateList } from '../../components/global-template-list/global-template-list';
import { GlobalTemplateRegistrationDialog } from '../../components/global-template-registration-dialog/global-template-registration-dialog';
import { GlobalTemplateUploadDialog } from '../../components/global-template-upload-dialog/global-template-upload-dialog';
import { GlobalTemplateAccessState } from '../../state/global-template-access-state';
import { GlobalTemplateState } from '../../state/global-template-state';

@Component({
  imports: [
    GlobalTemplateConfirmations,
    GlobalTemplateDetailDialog,
    GlobalTemplateList,
    GlobalTemplateRegistrationDialog,
    GlobalTemplateUploadDialog,
  ],
  providers: [GlobalTemplateState, GlobalTemplateAccessState],
  selector: 'erp-global-template-manager',
  styleUrl: './global-template-manager.scss',
  templateUrl: './global-template-manager.html',
})
export class GlobalTemplateManager {
  readonly state = inject(GlobalTemplateState);
  private readonly locale = inject(LocalizationRuntime);
  constructor() {
    void this.locale.loadNamespace('reporting');
  }
}
