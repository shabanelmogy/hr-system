import { Component, computed, inject, input, output } from '@angular/core';
import {
  ActionButton,
  CardList,
  CollectionCardFooter,
  CollectionCardHeader,
  CollectionCardTemplate,
  CollectionCell,
  CollectionColumnPipe,
  CollectionEmptyTemplate,
  FeedbackState,
  MyDataGrid,
  StatusBadge,
  RecordSummary,
  type RecordSummaryField,
  type CollectionColumn,
} from '../../../../shared/ui/public-api';
import type { ErrorLogRow } from '../../types/error-log';
import { ErrorLogPresentation } from '../../presentation/error-log-presentation';
import { ErrorLogReadState } from '../../state/error-log-read-state';
import { ErrorLogDetailState } from '../../state/error-log-detail-state';
import { ErrorLogCriteria } from '../error-log-criteria/error-log-criteria';
import { ErrorLogCardHeader } from '../error-log-card-header/error-log-card-header';
import { errorLogColumnDefinitions } from '../../types/error-log-column-filters';

@Component({
  imports: [
    ActionButton,
    CardList,
    CollectionCardFooter,
    CollectionCardHeader,
    CollectionCardTemplate,
    MyDataGrid,
    CollectionCell,
    CollectionColumnPipe,
    CollectionEmptyTemplate,
    FeedbackState,
    StatusBadge,
    ErrorLogCriteria,
    ErrorLogCardHeader,
    RecordSummary,
  ],
  selector: 'erp-error-log-collection',
  styleUrl: './error-log-collection.scss',
  templateUrl: './error-log-collection.html',
})
export class ErrorLogCollection {
  readonly reads = inject(ErrorLogReadState);
  readonly detail = inject(ErrorLogDetailState);
  readonly captions = inject(ErrorLogPresentation);
  readonly filtersVisible = input(false);
  readonly view = input<'grid' | 'cards'>('grid');
  readonly settingsAllowed = input(false);
  readonly settingsRequested = output<void>();
  readonly id = (row: ErrorLogRow) => row.id;
  readonly label = (row: ErrorLogRow) => row.summary;
  readonly search = computed(() => ({
    value: this.reads.searchDraft(),
    placeholder: this.captions.text('search'),
    maxLength: 120,
  }));
  readonly columns = computed<readonly CollectionColumn<ErrorLogRow>[]>(() => {
    const columns: CollectionColumn<ErrorLogRow>[] = [
      {
        key: 'occurredOnUtc',
        header: this.captions.text('occurredUtc'),
        width: 180,
        value: (row) => this.captions.date(row.occurredOnUtc),
      },
      {
        key: 'source',
        header: this.captions.text('source'),
        width: 100,
        value: (row) => this.captions.text('sources.' + row.source),
      },
      {
        key: 'severity',
        header: this.captions.text('severity'),
        width: 100,
        value: (row) => this.captions.text('severities.' + row.severity),
      },
      {
        key: 'userName',
        header: this.captions.text('user'),
        width: 130,
        value: (row) => row.userName ?? this.captions.text('notAvailable'),
      },
      {
        key: 'service',
        header: this.captions.text('service'),
        width: 130,
        value: (row) => row.service ?? this.captions.text('notAvailable'),
      },
      {
        key: 'action',
        header: this.captions.text('action'),
        width: 120,
        value: (row) => row.action ?? this.captions.text('notAvailable'),
      },
      {
        key: 'statusCode',
        header: this.captions.text('status'),
        width: 90,
        value: (row) => this.captions.numeric(row.statusCode),
      },
      {
        key: 'durationMs',
        header: this.captions.text('duration'),
        width: 110,
        value: (row) => this.captions.numeric(row.durationMs),
      },
      {
        key: 'client',
        header: this.captions.text('client'),
        width: 110,
        value: (row) => row.client ?? this.captions.text('notAvailable'),
      },
      {
        key: 'browser',
        header: this.captions.text('browser'),
        width: 110,
        value: (row) => row.browser ?? this.captions.text('notAvailable'),
      },
      {
        key: 'summary',
        header: this.captions.text('summary'),
        minWidth: 180,
        flex: 1,
        value: (row) => row.summary,
      },
      {
        key: 'ipAddress',
        header: this.captions.text('ipAddress'),
        width: 130,
        value: (row) => row.ipAddress ?? this.captions.text('notAvailable'),
      },
      {
        key: 'details',
        header: this.captions.text('details'),
        width: 100,
        value: () => (this.detail.canOpen() ? this.captions.text('view') : ''),
      },
    ];
    return columns.map((column) => {
      const definition = errorLogColumnDefinitions.find((filter) => filter.field === column.key);
      if (!definition) return column;
      if (column.key === 'source' || column.key === 'severity') {
        const values =
          column.key === 'source' ? ['api', 'job', 'web', 'mobile'] : ['error', 'warning'];
        return {
          ...column,
          filter: {
            ...definition,
            modes: ['equals', 'notEquals'] as const,
            choices: values.map((value) => ({
              value,
              label: this.captions.text(
                (column.key === 'source' ? 'sources.' : 'severities.') + value,
              ),
            })),
          },
        };
      }
      return { ...column, filter: definition };
    });
  });
  cardFields(row: ErrorLogRow): readonly RecordSummaryField[] {
    const value = (text: string | null) => text ?? this.captions.text('notAvailable');
    return [
      {
        id: 'source',
        label: this.captions.text('source'),
        value: this.captions.text('sources.' + row.source),
      },
      {
        id: 'status',
        label: this.captions.text('status'),
        value: this.captions.numeric(row.statusCode),
      },
      { id: 'service', label: this.captions.text('service'), value: value(row.service) },
      { id: 'action', label: this.captions.text('action'), value: value(row.action) },
      { id: 'user', label: this.captions.text('user'), value: value(row.userName) },
      {
        id: 'duration',
        label: this.captions.text('duration'),
        value: this.captions.numeric(row.durationMs),
      },
      { id: 'client', label: this.captions.text('client'), value: value(row.client) },
      { id: 'browser', label: this.captions.text('browser'), value: value(row.browser) },
    ];
  }
}
