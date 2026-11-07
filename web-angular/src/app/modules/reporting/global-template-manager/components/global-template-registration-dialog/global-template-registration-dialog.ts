import { Component, computed, inject } from '@angular/core';
import { formatByteSize } from '../../../../../shared/data/public-api';
import { LocalizationRuntime, UiTextPipe } from '../../../../../platform/localization/public-api';
import {
  ActionButton,
  AppIcon,
  CollectionCell,
  CollectionColumnPipe,
  DialogPanel,
  FeedbackState,
  MyDataGrid,
  OptionSelect,
  RecordSummary,
  StatusBadge,
  type CollectionColumn,
} from '../../../../../shared/ui/public-api';
import { GlobalTemplateState } from '../../state/global-template-state';
import type { GlobalTemplateCandidate } from '../../types/global-template';

@Component({
  imports: [
    ActionButton,
    AppIcon,
    CollectionCell,
    CollectionColumnPipe,
    DialogPanel,
    FeedbackState,
    MyDataGrid,
    OptionSelect,
    RecordSummary,
    StatusBadge,
    UiTextPipe,
  ],
  selector: 'erp-global-template-registration-dialog',
  templateUrl: './global-template-registration-dialog.html',
})
export class GlobalTemplateRegistrationDialog {
  readonly state = inject(GlobalTemplateState);
  readonly locale = inject(LocalizationRuntime);
  readonly createEntityOptions = computed(() =>
    this.state
      .contracts()
      .filter((contract) => this.state.canAt(contract.entityKey, 'Create'))
      .map((contract) => ({
        value: contract.entityKey,
        label: this.text('globalTemplates.entities.' + contract.entityKey),
      })),
  );
  readonly columns = computed<readonly CollectionColumn<GlobalTemplateCandidate>[]>(() => [
    {
      key: 'name',
      header: this.text('crystalReports.displayName'),
      value: (row) => row.displayName,
      minWidth: 200,
      flex: 2,
    },
    {
      key: 'size',
      header: this.text('globalTemplates.fileSize'),
      value: (row) => formatByteSize(row.size, this.locale.language()),
      width: 100,
    },
    {
      key: 'registered',
      header: this.text('globalTemplates.registrationStatus'),
      width: 175,
      value: (row) =>
        this.text(
          row.isImported === null
            ? 'globalTemplates.registrationUnknown'
            : row.isImported
              ? 'globalTemplates.registered'
              : 'globalTemplates.notRegistered',
        ),
    },
    {
      key: 'reason',
      header: this.text('globalTemplates.reason'),
      value: (row) => row.validationReason,
      minWidth: 200,
    },
    {
      key: 'register',
      header: this.text('globalTemplates.registerReport'),
      value: (row) => (row.isImported ? this.text('globalTemplates.registered') : ''),
      width: 208,
      compactWidth: 72,
      hideable: false,
      align: 'center',
    },
  ]);
  readonly candidateId = (row: GlobalTemplateCandidate) => row.sourceId;
  text(key: string): string {
    return this.locale.translate(key, 'reporting');
  }
}
