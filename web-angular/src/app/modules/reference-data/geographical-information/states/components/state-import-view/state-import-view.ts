import { Component, computed, inject, output, signal } from '@angular/core';
import {
  LocalizationRuntime,
  UiTextPipe,
} from '../../../../../../platform/localization/public-api';
import {
  SpreadsheetImportPanel,
  MyDataGrid,
  CollectionColumnPipe,
  CollectionCell,
  StatusBadge,
  FeedbackState,
  type CollectionColumn,
  type CollectionSource,
} from '../../../../../../shared/ui/public-api';
import {
  downloadSpreadsheetBlob,
  type ImportRowStatus,
} from '../../../../../../shared/data/spreadsheet-public-api';
import { StateImportState } from '../../state/state-import-state';
import { stateImportFields } from '../../validation/state-import';
import type { StateImportIssue, StateImportRow } from '../../validation/state-import';

@Component({
  selector: 'erp-state-import-view',
  providers: [StateImportState],
  imports: [
    CollectionColumnPipe,
    SpreadsheetImportPanel,
    MyDataGrid,
    CollectionCell,
    StatusBadge,
    FeedbackState,
    UiTextPipe,
  ],
  templateUrl: './state-import-view.html',
  styleUrl: './state-import-view.scss',
})
export class StateImportView {
  readonly state = inject(StateImportState);
  readonly locale = inject(LocalizationRuntime);
  readonly review = output<void>();
  readonly page = signal({ pageIndex: 0, pageSize: 10 });
  readonly id = (row: StateImportRow) => row.rowNumber;
  readonly rowLabel = (row: StateImportRow) =>
    row.draft[this.locale.language() === 'ar' ? 'nameAr' : 'nameEn'];
  readonly message = computed(() => {
    const key = this.state.message();
    return key
      ? this.locale.translate(
          key,
          key.startsWith('states.') ? 'reference-states' : 'core',
          this.state.errorDetails(),
        )
      : '';
  });
  readonly messageDetail = computed(() => {
    const affected = this.state.rows().filter((row) => row.issues.length).length;
    if (affected)
      return this.locale.translate('imports.rowsNeedAttention', 'core', { count: affected });
    const cell = this.state.errorDetails()['cell'];
    return cell ? this.locale.translate('imports.cellLocation', 'core', { cell }) : '';
  });
  readonly counts = computed<Readonly<Partial<Record<ImportRowStatus, number>>>>(() =>
    this.state.rows().reduce<Partial<Record<ImportRowStatus, number>>>((counts, row) => {
      counts[row.status] = (counts[row.status] ?? 0) + 1;
      return counts;
    }, {}),
  );
  readonly source = computed<CollectionSource<StateImportRow>>(() => {
    const rows = this.state.rows(),
      page = this.page(),
      pageIndex = Math.min(page.pageIndex, Math.max(0, Math.ceil(rows.length / page.pageSize) - 1)),
      query = {
        scopeKey: 'state-import:' + this.state.fileName(),
        criteriaKey: JSON.stringify(rows.map((row) => row.status)),
        pageIndex,
        pageSize: page.pageSize,
      };
    return {
      query,
      kind: 'ready',
      result: {
        query,
        rows: rows.slice(pageIndex * page.pageSize, (pageIndex + 1) * page.pageSize),
        total: rows.length,
        hasNextPage: (pageIndex + 1) * page.pageSize < rows.length,
      },
    };
  });
  readonly columns = computed<readonly CollectionColumn<StateImportRow>[]>(() => [
    { key: 'row', header: this.text('imports.row'), value: (row) => row.rowNumber, width: 80 },
    ...stateImportFields.map((field) => ({
      key: field,
      header: this.fieldLabel(field),
      value: (row: StateImportRow) => row.draft[field],
      minWidth: 140,
    })),
    {
      key: 'status',
      header: this.text('imports.status'),
      value: (row) => this.text('imports.' + row.status),
      width: 160,
    },
    {
      key: 'errors',
      header: this.text('imports.errorDetails'),
      value: (row) => (row.issues.length ? this.rowIssues(row) : ''),
      minWidth: 320,
    },
  ]);
  rowIssues(row: StateImportRow): string {
    const details = row.issues.map((issue) => this.issueText(issue)).join(' | ');
    return `${this.text('imports.row')} ${row.rowNumber}: ${details}`;
  }
  issueText(issue: StateImportIssue): string {
    const field = issue.field;
    const label = field ? this.fieldLabel(field) + ': ' : '';
    if (issue.kind === 'duplicate') {
      return (
        label +
        this.locale.translate('states.import.duplicateField', 'reference-states', {
          row: issue.relatedRow ?? '',
        })
      );
    }
    if (issue.kind === 'server' && issue.message) return label + issue.message;
    if (issue.kind === 'batchRejected') return this.text('imports.batchRejectedRow');
    if (issue.kind === 'notSent') return this.text('imports.notSent');
    if (issue.kind === 'uncertain') return this.text('imports.submissionUncertain');
    if (!field) return this.text('validation.invalidValues');
    if (issue.kind === 'unknownCountry' || issue.kind === 'ambiguousCountry')
      return label + this.locale.translate('states.import.' + issue.kind, 'reference-states');
    if (issue.kind === 'pattern')
      return label + this.locale.translate('states.invalidCode', 'reference-states');
    const key =
      issue.kind === 'minlength'
        ? 'minLength'
        : issue.kind === 'maxlength'
          ? 'maxLength'
          : issue.kind;
    return (
      label +
      this.locale.translate('validation.' + key, 'core', {
        count: issue.kind === 'minlength' ? 2 : field === 'code' ? 10 : 100,
      })
    );
  }
  async select(file: File): Promise<void> {
    await this.state.select(file);
    this.page.set({ pageIndex: 0, pageSize: 10 });
  }
  async download(): Promise<void> {
    const blob = await this.state.download();
    if (blob) downloadSpreadsheetBlob(blob, 'states-import-template.xlsx');
  }
  text(key: string): string {
    return this.locale.translate(key);
  }
  fieldLabel(field: string): string {
    return this.locale.translate(
      ['nameAr', 'nameEn'].includes(field) ? 'general.' + field : 'states.' + field,
      ['nameAr', 'nameEn'].includes(field) ? 'core' : 'reference-states',
    );
  }
}
