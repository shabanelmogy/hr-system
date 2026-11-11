import { Component, computed, inject, input } from '@angular/core';
import {
  MyDataGrid,
  CollectionEmptyTemplate,
  FeedbackState,
  CollectionTextFilter,
  createLocalCollection,
  type CollectionColumn,
} from '../../../../shared/ui/public-api';
import { AuditPresentation } from '../../presentation/audit-presentation';
import type { AuditDetails } from '../../types/audit-trail';

interface ChangeRow {
  readonly id: number;
  readonly field: string;
  readonly oldValue: string | null;
  readonly newValue: string | null;
}
@Component({
  selector: 'erp-audit-changes',
  imports: [MyDataGrid, CollectionEmptyTemplate, FeedbackState, CollectionTextFilter],
  templateUrl: './audit-changes.html',
  styleUrl: './audit-changes.scss',
})
export class AuditChanges {
  readonly details = input.required<AuditDetails>();
  readonly captions = inject(AuditPresentation);
  readonly id = (row: ChangeRow) => row.id;
  readonly label = (row: ChangeRow) => this.captions.label('fields', row.field);
  private readonly rows = computed(() =>
    this.details().changes.map((change, id) => ({ ...change, id })),
  );
  readonly collection = createLocalCollection<ChangeRow>({
    rows: this.rows,
    scopeKey: () =>
      'audit-changes:' + this.details().entry.moduleCode + ':' + this.details().entry.id,
    pageSizes: [10, 25, 50],
    textFilterFields: ['field', 'oldValue', 'newValue'],
    sortValues: {
      field: this.label,
      oldValue: (row) => row.oldValue,
      newValue: (row) => row.newValue,
    },
  });
  readonly source = this.collection.source;
  readonly changePage = this.collection.changePage;
  readonly columns = computed<readonly CollectionColumn<ChangeRow>[]>(() => [
    {
      key: 'field',
      sortField: 'field',
      header: this.captions.text('field'),
      minWidth: 180,
      flex: 1,
      value: this.label,
    },
    {
      key: 'oldValue',
      sortField: 'oldValue',
      header: this.captions.text('oldValue'),
      minWidth: 180,
      flex: 1,
      value: (row) => row.oldValue ?? this.captions.text('empty'),
    },
    {
      key: 'newValue',
      sortField: 'newValue',
      header: this.captions.text('newValue'),
      minWidth: 180,
      flex: 1,
      value: (row) => row.newValue ?? this.captions.text('empty'),
    },
  ]);
  readonly filterColumns = computed(() =>
    this.columns().map((column) => ({ field: column.key, label: column.header })),
  );
}
