import { CommandFailure } from '../../../../../shared/data/public-api';
import type { CountryLookup } from '../../countries/lookup.public-api';
import { stateImportRows, validateStateImport } from './state-import';
import { stateImportFailureRows } from './state-import-feedback';

describe('State spreadsheet parent resolution and atomic feedback', () => {
  const countries: readonly CountryLookup[] = [
    { id: 1, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false },
    { id: 2, nameAr: 'السعودية', nameEn: 'Saudi Arabia', isDeleted: false },
  ];
  it('resolves either parent caption and scopes duplicate names/codes to one Country', () => {
    const result = validateStateImport(
      stateImportRows([
        { rowNumber: 2, values: ['القاهرة', 'Cairo', 'cai', ' egypt '] },
        { rowNumber: 3, values: ['القاهرة', 'Cairo', 'CAI', 'السعودية'] },
        { rowNumber: 4, values: ['القاهرة', 'Cairo', 'CAI', 'مصر'] },
      ]),
      countries,
    );
    expect(result.valid.map((row) => [row.code, row.countryId])).toEqual([
      ['CAI', 1],
      ['CAI', 2],
    ]);
    expect(result.rows.map((row) => row.status)).toEqual(['submitted', 'submitted', 'invalid']);
    expect(result.rows[2]?.issues).toContainEqual({
      field: 'code',
      kind: 'duplicate',
      relatedRow: 2,
    });
  });
  it('rejects missing, archived and ambiguous parents without choosing a matching ID arbitrarily', () => {
    const rows = stateImportRows([
      { rowNumber: 2, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] },
      { rowNumber: 3, values: ['الرياض', 'Riyadh', 'RYD', 'Saudi Arabia'] },
      { rowNumber: 4, values: ['جدة', 'Jeddah', 'JED', 'Unknown'] },
    ]);
    const result = validateStateImport(rows, [
      ...countries.map((country) => (country.id === 2 ? { ...country, isDeleted: true } : country)),
      { id: 3, nameAr: 'Egypt', nameEn: 'Other', isDeleted: false },
    ]);
    expect(result.valid).toEqual([]);
    expect(result.rows.map((row) => row.issues[0]?.kind)).toEqual([
      'ambiguousCountry',
      'unknownCountry',
      'unknownCountry',
    ]);
  });
  it('does not reserve duplicate keys for invalid rows and preserves actual spreadsheet row numbers', () => {
    const result = validateStateImport(
      stateImportRows([
        { rowNumber: 2, values: ['', 'Cairo', 'CAI', 'Egypt'] },
        { rowNumber: 5, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] },
      ]),
      countries,
    );
    expect(result.valid).toHaveLength(1);
    const failed = stateImportFailureRows(
      result.rows,
      new CommandFailure('rejected', 400, { 'states[0].countryId': 'Parent changed' }),
    );
    expect(failed[0]?.status).toBe('invalid');
    expect(failed[1]).toMatchObject({
      rowNumber: 5,
      status: 'failed',
      issues: [{ field: 'countryName', kind: 'server', message: 'Parent changed' }],
    });
  });
  it('never blames a specific row for a batch-only duplicate or uncertain dispatched result', () => {
    const checked = validateStateImport(
      stateImportRows([{ rowNumber: 8, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] }]),
      countries,
    );
    expect(
      stateImportFailureRows(
        checked.rows,
        new CommandFailure('rejected', 409, {}, ['State.Duplicated']),
      )[0]?.issues,
    ).toEqual([{ field: null, kind: 'batchRejected' }]);
    expect(
      stateImportFailureRows(checked.rows, new CommandFailure('uncertain', 503))[0],
    ).toMatchObject({ status: 'uncertain', issues: [{ field: null, kind: 'uncertain' }] });
  });
});
