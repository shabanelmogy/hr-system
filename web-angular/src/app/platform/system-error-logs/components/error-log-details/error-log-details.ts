import { Component, computed, inject } from '@angular/core';
import {
  ActionButton,
  CopyButton,
  DialogPanel,
  FeedbackState,
  RecordSummary,
  SurfaceCard,
  StatusBadge,
  TextPanel,
} from '../../../../shared/ui/public-api';
import { ErrorLogDetailState } from '../../state/error-log-detail-state';
import { ErrorLogPresentation } from '../../presentation/error-log-presentation';
import {
  errorLogDetailGroups,
  formatErrorLogDetail,
} from '../../presentation/error-log-detail-presentation';

@Component({
  selector: 'erp-error-log-details',
  imports: [
    ActionButton,
    CopyButton,
    DialogPanel,
    FeedbackState,
    RecordSummary,
    SurfaceCard,
    StatusBadge,
    TextPanel,
  ],
  templateUrl: './error-log-details.html',
  styleUrl: './error-log-details.scss',
})
export class ErrorLogDetails {
  readonly state = inject(ErrorLogDetailState);
  readonly captions = inject(ErrorLogPresentation);
  readonly detail = this.state.item;
  readonly groups = computed(() => {
    const entry = this.detail()?.entry;
    return entry ? errorLogDetailGroups(entry, this.captions) : [];
  });
  readonly copyContent = (): string | null => {
    const detail = this.state.canOpen() ? this.state.item() : null;
    return detail ? formatErrorLogDetail(detail, this.captions) : null;
  };
}
