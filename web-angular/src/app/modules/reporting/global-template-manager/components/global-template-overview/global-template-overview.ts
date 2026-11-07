import { Component, computed, inject } from '@angular/core';
import { formatByteSize } from '../../../../../shared/data/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  ActionButtonGroup,
  AppIcon,
  FeedbackState,
  RecordSummary,
  SurfaceCard,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';
import type { GlobalTemplateVersion } from '../../types/global-template';
import { formatGlobalTemplateDateTime } from '../../utils/global-template-presentation';

@Component({
  imports: [
    ActionButton,
    ActionButtonGroup,
    AppIcon,
    FeedbackState,
    RecordSummary,
    SurfaceCard,
    UiTextPipe,
  ],
  selector: 'erp-global-template-overview',
  templateUrl: './global-template-overview.html',
})
export class GlobalTemplateOverview {
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
  readonly metadata = computed(() => {
    const detail = this.state.detail();
    if (!detail) return [];
    const version =
      detail.versions.find((item) => item.versionNumber === detail.currentVersionNumber) ??
      detail.versions.reduce<GlobalTemplateVersion | undefined>(
        (latest, item) => (!latest || item.versionNumber > latest.versionNumber ? item : latest),
        undefined,
      );
    const items = [
      {
        key: 'crystalReports.entity',
        value: this.text('globalTemplates.entities.' + detail.entityKey),
      },
      { key: 'crystalReports.reportKey', value: detail.reportKey },
      { key: 'crystalReports.description', value: detail.description || '—' },
      {
        key: 'crystalReports.status',
        value: this.text(
          detail.isArchived
            ? 'crystalReports.archived'
            : detail.isPublished
              ? 'crystalReports.published'
              : 'globalTemplates.draft',
        ),
      },
      {
        key: 'crystalReports.updatedOn',
        value: formatGlobalTemplateDateTime(detail.updatedOn, this.locale.language()),
      },
    ];
    if (version)
      items.push(
        { key: 'crystalReports.version', value: 'v' + version.versionNumber },
        { key: 'crystalReports.displayName', value: version.summaryTitle || '—' },
        { key: 'globalTemplates.subject', value: version.summarySubject || '—' },
        { key: 'crystalReports.reportFile', value: version.originalFileName },
        {
          key: 'globalTemplates.fileSize',
          value: formatByteSize(version.size, this.locale.language()),
        },
        {
          key: 'globalTemplates.createdOn',
          value: formatGlobalTemplateDateTime(version.createdOn, this.locale.language()),
        },
      );
    return items.map((item) => ({ ...item, label: this.text(item.key) }));
  });
  text(key: string): string {
    return this.locale.translate(key, 'reporting');
  }
}
