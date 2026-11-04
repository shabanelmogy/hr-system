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
import { downloadSpreadsheetBlob } from '../../../../../../shared/data/spreadsheet-public-api';
import { CountryImportState } from '../../state/country-import-state';
import { countryMutationFields, countryFieldError } from '../../validation/country-mutation';
import type { CountryImportRow } from '../../validation/country-import';

@Component({
  selector: 'erp-country-import-view',
  providers: [CountryImportState],
  imports: [
    CollectionColumnPipe,
    SpreadsheetImportPanel,
    MyDataGrid,
    CollectionCell,
    StatusBadge,
    FeedbackState,
    UiTextPipe,
  ],
  templateUrl: './country-import-view.html',
})
export class CountryImportView {
  readonly state = inject(CountryImportState);
  readonly locale = inject(LocalizationRuntime);
  readonly review = output<void>();
  readonly page = signal({ pageIndex: 0, pageSize: 10 });
  readonly id = (row: CountryImportRow) => row.rowNumber;
  readonly rowLabel = (row: CountryImportRow) =>
    row.draft[this.locale.language() === 'ar' ? 'nameAr' : 'nameEn'];
  readonly message = computed(() => {
    const key = this.state.message();
    return key
      ? this.locale.translate(
          key,
          key.startsWith('countries.') ? 'reference-countries' : 'core',
          this.state.errorDetails(),
        )
      : '';
  });
  readonly source = computed<CollectionSource<CountryImportRow>>(() => {
    const rows = this.state.rows(),
      page = this.page(),
      pageIndex = Math.min(page.pageIndex, Math.max(0, Math.ceil(rows.length / page.pageSize) - 1)),
      query = {
        scopeKey: 'country-import:' + this.state.fileName(),
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
  readonly columns = computed<readonly CollectionColumn<CountryImportRow>[]>(() => [
    { key: 'row', header: this.text('imports.row'), value: (row) => row.rowNumber, width: 80 },
    ...countryMutationFields.map((field) => ({
      key: field,
      header: this.fieldLabel(field),
      value: (row: CountryImportRow) => row.draft[field],
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
      value: (row) =>
        row.errors
          .map((field) => {
            if (field === 'duplicate')
              return this.locale.translate(
                'countries.import.duplicateInFile',
                'reference-countries',
              );
            const name = countryMutationFields.find((key) => key === field);
            if (!name) return '';
            const error = countryFieldError(name, row.draft[name]);
            return (
              this.fieldLabel(name) +
              ': ' +
              this.text(error?.['required'] ? 'validation.required' : 'validation.invalidValues')
            );
          })
          .join(' | '),
      minWidth: 280,
    },
  ]);
  async select(file: File): Promise<void> {
    await this.state.select(file);
    this.page.set({ pageIndex: 0, pageSize: 10 });
  }
  async download(): Promise<void> {
    const blob = await this.state.download();
    if (blob) downloadSpreadsheetBlob(blob, 'countries-import-template.xlsx');
  }
  text(key: string): string {
    return this.locale.translate(key);
  }
  fieldLabel(field: string): string {
    return this.locale.translate(
      ['nameAr', 'nameEn'].includes(field) ? 'general.' + field : 'countries.' + field,
      ['nameAr', 'nameEn'].includes(field) ? 'core' : 'reference-countries',
    );
  }
}
