import { fixtureItem } from '../../../../../../testing/fixture-item';
import {
  countryBulkPayload,
  countryImportRows,
  validateCountryImport,
  parseCountryCreatedCount,
} from './country-import';
describe('Country import row contract', () => {
  const rows = () =>
    countryImportRows([
      { rowNumber: 2, values: [' مصر ', 'Egypt', 'eg', 'egy', '+20', 'egp'] },
      { rowNumber: 3, values: ['السعودية', ' egypt ', 'SA', 'SAU', '', ''] },
    ]);
  it('normalizes one valid batch and marks same-field duplicates invalid', () => {
    const checked = validateCountryImport(rows());
    expect(checked.valid).toHaveLength(1);
    expect(checked.rows[1]).toMatchObject({ status: 'invalid', errors: ['duplicate'] });
    expect(checked.rows[1]?.issues).toEqual([
      { field: 'nameEn', kind: 'duplicate', relatedRow: 2 },
    ]);
    expect(countryBulkPayload(checked.valid)[0]).toMatchObject({
      nameAr: 'مصر',
      alpha2Code: 'EG',
      currencyCode: 'EGP',
    });
  });
  it('uses the canonical field validator and never includes invalid rows', () => {
    const input = rows();
    const checked = validateCountryImport([
      {
        ...fixtureItem(input, 0),
        draft: { ...fixtureItem(input, 0).draft, nameAr: '', phoneCode: 'bad' },
      },
    ]);
    expect(checked.valid).toEqual([]);
    expect(fixtureItem(checked.rows, 0).errors).toEqual(['nameAr', 'phoneCode']);
    expect(fixtureItem(checked.rows, 0).issues).toEqual([
      { field: 'nameAr', kind: 'required' },
      { field: 'phoneCode', kind: 'pattern' },
    ]);
  });
  it('points duplicates to the earlier accepted row, skipping an invalid matching row', () => {
    const checked = validateCountryImport(
      countryImportRows([
        { rowNumber: 2, values: ['', 'Egypt', 'EG', '', '', ''] },
        { rowNumber: 8, values: ['مصر', 'Egypt', 'EG', '', '', ''] },
        { rowNumber: 12, values: ['دولة', 'Egypt', 'EG', '', '', ''] },
      ]),
    );
    expect(checked.valid).toHaveLength(1);
    expect(checked.rows[2]?.issues).toEqual([
      { field: 'nameEn', kind: 'duplicate', relatedRow: 8 },
      { field: 'alpha2Code', kind: 'duplicate', relatedRow: 8 },
    ]);
  });
  it('allows blank optional codes across rows and compares only corresponding fields', () => {
    const input = fixtureItem(rows(), 0);
    const other = {
      ...input,
      rowNumber: 4,
      draft: { ...input.draft, nameAr: 'Egypt', nameEn: 'Other', alpha2Code: '', alpha3Code: '' },
    };
    const checked = validateCountryImport([
      { ...input, draft: { ...input.draft, alpha2Code: '', alpha3Code: '' } },
      other,
    ]);
    expect(checked.valid).toHaveLength(2);
  });
  it('revalidates bounded batches and refuses partial or malformed success', () => {
    expect(() => countryBulkPayload([])).toThrow();
    expect(() => countryBulkPayload(Array(101).fill(fixtureItem(rows(), 0).draft))).toThrow();
    expect(() => countryBulkPayload(rows().map((row) => row.draft))).toThrow();
    expect(() => parseCountryCreatedCount({ createdCount: 1 }, 2)).toThrow();
    expect(parseCountryCreatedCount({ createdCount: 2 }, 2)).toBe(2);
  });
});
