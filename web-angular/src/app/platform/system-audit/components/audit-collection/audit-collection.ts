import { Component, computed, inject, input } from '@angular/core';
import {
  MyDataGrid,
  CollectionCell,
  CollectionColumnPipe,
  CollectionEmptyTemplate,
  FeedbackState,
  StatusBadge,
  type CollectionColumn,
  type CollectionSource,
} from '../../../../shared/ui/public-api';
import { AuditReadState } from '../../state/audit-read-state';
import { AuditDetailState } from '../../state/audit-detail-state';
import { AuditPresentation } from '../../presentation/audit-presentation';
import { auditKey, auditPageSize, type AuditItem } from '../../types/audit-trail';
import { AuditCriteria } from '../audit-criteria/audit-criteria';
import { auditColumnDefinitions } from '../../types/audit-column-filters';
import { auditActions } from '../../types/audit-trail';

interface AuditRow extends AuditItem {
  readonly key: string;
}
@Component({
  selector: 'erp-audit-collection',
  imports: [
    MyDataGrid,
    CollectionCell,
    CollectionColumnPipe,
    CollectionEmptyTemplate,
    FeedbackState,
    StatusBadge,
    AuditCriteria,
  ],
  templateUrl: './audit-collection.html',
  styleUrl: './audit-collection.scss',
})
export class AuditCollection {
  readonly pageSizes: readonly number[] = [auditPageSize];
  readonly reads = inject(AuditReadState);
  readonly detail = inject(AuditDetailState);
  readonly captions = inject(AuditPresentation);
  readonly filtersVisible = input(false);
  readonly id = (row: AuditRow) => row.key;
  readonly source = computed<CollectionSource<AuditRow>>(() => {
    const source = this.reads.source();
    return source.result
      ? {
          ...source,
          result: {
            ...source.result,
            rows: source.result.rows.map((row) => ({ ...row, key: auditKey(row) })),
          },
        }
      : { query: source.query, kind: source.kind };
  });
  readonly label = (row: AuditItem) =>
    this.captions.label('entities', row.entityName) + ' · ' + (row.entityDisplay ?? row.entityKey);
  readonly search = computed(() => ({
    value: this.reads.searchDraft(),
    placeholder: this.captions.text('recordKey'),
    maxLength: 200,
  }));
  readonly columns = computed<readonly CollectionColumn<AuditRow>[]>(() => {
    const columns: CollectionColumn<AuditRow>[] = [
      {
        key: 'occurredOn',
        header: this.captions.text('when'),
        width: 180,
        value: (row) => this.captions.date(row.occurredOn),
      },
      {
        key: 'action',
        header: this.captions.text('action'),
        width: 140,
        value: (row) => this.captions.text('actions.' + row.action),
      },
      {
        key: 'record',
        header: this.captions.text('record'),
        minWidth: 200,
        flex: 1,
        value: this.label,
      },
      {
        key: 'moduleCode',
        header: this.captions.text('module'),
        width: 170,
        value: (row) => this.captions.label('modules', row.moduleCode),
      },
      {
        key: 'userName',
        header: this.captions.text('user'),
        minWidth: 160,
        flex: 1,
        value: (row) => row.userName ?? row.userId ?? this.captions.text('system'),
      },
      {
        key: 'changeCount',
        header: this.captions.text('changes'),
        width: 110,
        value: (row) => row.changeCount,
      },
    ];
    return columns.map((column) => {
      const definition = auditColumnDefinitions.find((filter) => filter.field === column.key);
      return definition
        ? {
            ...column,
            filter:
              column.key === 'action'
                ? {
                    ...definition,
                    modes: ['equals', 'notEquals'] as const,
                    choices: auditActions.map((value) => ({
                      value,
                      label: this.captions.text('actions.' + value),
                    })),
                  }
                : definition,
          }
        : column;
    });
  });
}
