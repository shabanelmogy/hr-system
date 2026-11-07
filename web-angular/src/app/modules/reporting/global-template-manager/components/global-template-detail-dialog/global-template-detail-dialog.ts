import { Component, computed, inject, input, linkedSignal, viewChild } from '@angular/core';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ContentTabs,
  DialogPanel,
  FeedbackState,
  FormCloseGuard,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplatePermissions } from '../global-template-permissions/global-template-permissions';
import { GlobalTemplateState } from '../../state/global-template-state';
import { GlobalTemplateOverview } from '../global-template-overview/global-template-overview';
import { GlobalTemplateVersions } from '../global-template-versions/global-template-versions';

@Component({
  imports: [
    ContentTabs,
    DialogPanel,
    FeedbackState,
    FormCloseGuard,
    GlobalTemplateOverview,
    GlobalTemplatePermissions,
    GlobalTemplateVersions,
    UiTextPipe,
  ],
  selector: 'erp-global-template-detail-dialog',
  templateUrl: './global-template-detail-dialog.html',
})
export class GlobalTemplateDetailDialog {
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
  readonly closeGuard = viewChild.required<FormCloseGuard>('detailCloseGuard');
  readonly initialTab = input<'overview' | 'versions' | 'permissions'>('overview');
  readonly selectedTab = linkedSignal<string>(() => this.initialTab());
  readonly tabs = computed(() =>
    ['overview', 'versions', 'permissions'].map((id) => ({
      id,
      label: this.locale.translate('crystalReports.' + id, 'reporting'),
    })),
  );
}
