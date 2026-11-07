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
import { DistrictImportState } from '../../state/district-import-state';
import { districtImportFields } from '../../validation/district-import';
import type { DistrictImportIssue, DistrictImportRow } from '../../validation/district-import';

@Component({
  selector: 'erp-district-import-view',
  providers: [DistrictImportState],
  imports: [
    CollectionColumnPipe,
    SpreadsheetImportPanel,
    MyDataGrid,
    CollectionCell,
    StatusBadge,
    FeedbackState,
    UiTextPipe,
  ],
  templateUrl: './district-import-view.html',
  styleUrl: './district-import-view.scss',
})
export class DistrictImportView {
  readonly state = inject(DistrictImportState);
  readonly locale = inject(LocalizationRuntime);
  readonly review = output<void>();
  readonly page = signal({ pageIndex: 0, pageSize: 10 });
  readonly id = (row: DistrictImportRow) => row.rowNumber;
  readonly rowLabel = (row: DistrictImportRow) =>
    row.draft[this.locale.language() === 'ar' ? 'nameAr' : 'nameEn'];
  readonly message = computed(() => {
    const key = this.state.message();
    return key
      ? this.locale.translate(
          key,
          key.startsWith('districts.') ? 'reference-districts' : 'core',
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
  readonly source = computed<CollectionSource<DistrictImportRow>>(() => {
    const rows = this.state.rows(),
      page = this.page(),
      pageIndex = Math.min(page.pageIndex, Math.max(0, Math.ceil(rows.length / page.pageSize) - 1)),
      query = {
        scopeKey: 'district-import:' + this.state.fileName(),
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
  readonly columns = computed<readonly CollectionColumn<DistrictImportRow>[]>(() => [
    { key: 'row', header: this.text('imports.row'), value: (row) => row.rowNumber, width: 80 },
    ...districtImportFields.map((field) => ({
      key: field,
      header: this.fieldLabel(field),
      value: (row: DistrictImportRow) => row.draft[field],
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
  rowIssues(row: DistrictImportRow): string {
    const details = row.issues.map((issue) => this.issueText(issue)).join(' | ');
    return `${this.text('imports.row')} ${row.rowNumber}: ${details}`;
  }
  issueText(issue: DistrictImportIssue): string {
    const field = issue.field;
    const label = field ? this.fieldLabel(field) + ': ' : '';
    if (issue.kind === 'duplicate') {
      return (
        label +
        this.locale.translate('districts.import.duplicateField', 'reference-districts', {
          row: issue.relatedRow ?? '',
        })
      );
    }
    if (issue.kind === 'server' && issue.message) return label + issue.message;
    if (issue.kind === 'batchRejected') return this.text('imports.batchRejectedRow');
    if (issue.kind === 'notSent') return this.text('imports.notSent');
    if (issue.kind === 'uncertain') return this.text('imports.submissionUncertain');
    if (!field) return this.text('validation.invalidValues');
    if (issue.kind === 'unknownState' || issue.kind === 'ambiguousState')
      return label + this.locale.translate('districts.import.' + issue.kind, 'reference-districts');
    if (issue.kind === 'pattern')
      return label + this.locale.translate('districts.invalidCode', 'reference-districts');
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
    if (blob) downloadSpreadsheetBlob(blob, 'districts-import-template.xlsx');
  }
  text(key: string): string {
    return this.locale.translate(key);
  }
  fieldLabel(field: string): string {
    return this.locale.translate(
      ['nameAr', 'nameEn'].includes(field) ? 'general.' + field : 'districts.' + field,
      ['nameAr', 'nameEn'].includes(field) ? 'core' : 'reference-districts',
    );
  }
}
