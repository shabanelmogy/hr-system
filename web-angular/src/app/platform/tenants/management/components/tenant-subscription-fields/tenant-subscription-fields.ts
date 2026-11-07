import { Component, computed, inject } from '@angular/core';
import { FormField } from '@angular/forms/signals';
import {
  DateField,
  NumericField,
  ReferenceField,
  TextField,
  type ReferenceSource,
} from '../../../../../shared/ui/public-api';
import { subscriptionStatuses } from '../../../types/dashboard-contracts';
import { TenantEditorState } from '../../state/tenant-editor-state';
import { TenantFormPresentation } from '../../presentation/tenant-form-presentation';

@Component({
  selector: 'erp-tenant-subscription-fields',
  imports: [FormField, DateField, NumericField, ReferenceField, TextField],
  styleUrl: './tenant-subscription-fields.scss',
  templateUrl: './tenant-subscription-fields.html',
})
export class TenantSubscriptionFields {
  readonly editor = inject(TenantEditorState);
  readonly captions = inject(TenantFormPresentation);
  readonly statuses = computed<ReferenceSource>(() => {
    const query = { scopeKey: 'tenant-subscription-status', search: '' };
    return {
      query,
      kind: 'ready',
      result: {
        query,
        hasMore: false,
        options: subscriptionStatuses.map((value) => ({
          value,
          label: this.captions.text('statuses.' + value),
        })),
      },
    };
  });
}
