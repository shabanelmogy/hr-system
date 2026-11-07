import { Component, computed, inject } from '@angular/core';
import {
  DialogPanel,
  RecordSummary,
  FeedbackState,
  ActionButton,
  type RecordSummaryField,
} from '../../../../shared/ui/public-api';
import { UiTextPipe } from '../../../localization/public-api';
import { AuditDetailState } from '../../state/audit-detail-state';
import { AuditPresentation } from '../../presentation/audit-presentation';
import { AuditChanges } from '../audit-changes/audit-changes';

@Component({
  selector: 'erp-audit-details',
  imports: [DialogPanel, RecordSummary, FeedbackState, ActionButton, UiTextPipe, AuditChanges],
  templateUrl: './audit-details.html',
})
export class AuditDetails {
  readonly state = inject(AuditDetailState);
  readonly captions = inject(AuditPresentation);
  readonly details = computed(() => {
    const view = this.state.view();
    return view.kind === 'ready' ? view.data : null;
  });
  readonly fields = computed<readonly RecordSummaryField[]>(() => {
    const item = this.details()?.entry;
    return item
      ? [
          {
            id: 'module',
            label: this.captions.text('module'),
            value: this.captions.label('modules', item.moduleCode),
          },
          { id: 'key', label: this.captions.text('recordKey'), value: item.entityKey },
          {
            id: 'user',
            label: this.captions.text('user'),
            value: item.userName ?? item.userId ?? this.captions.text('system'),
          },
          {
            id: 'when',
            label: this.captions.text('when'),
            value: this.captions.date(item.occurredOn),
          },
        ]
      : [];
  });
  readonly title = computed(() => {
    const item = this.state.item();
    return item ? this.captions.label('entities', item.entityName) : this.captions.text('title');
  });
  readonly description = computed(() => {
    const item = this.state.item();
    return item ? (item.entityDisplay ?? item.entityKey) : '';
  });
}
