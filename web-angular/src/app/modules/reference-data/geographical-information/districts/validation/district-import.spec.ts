import { CommandFailure } from '../../../../../shared/data/public-api';
import type { StateLookup } from '../../states/lookup.public-api';
import { districtImportRows, validateDistrictImport } from './district-import';
import { districtImportFailureRows } from './district-import-feedback';

describe('District spreadsheet parent resolution and atomic feedback', () => {
  const states: readonly StateLookup[] = [
    { id: 1, nameAr: 'مصر', nameEn: 'Egypt', code: 'CAI', countryId: 1 },
    { id: 2, nameAr: 'السعودية', nameEn: 'Saudi Arabia', code: 'CAI', countryId: 1 },
  ];
  it('resolves either parent caption and scopes duplicate names/codes to one State', () => {
    const result = validateDistrictImport(
      districtImportRows([
        { rowNumber: 2, values: ['القاهرة', 'Cairo', 'cai', ' egypt '] },
        { rowNumber: 3, values: ['القاهرة', 'Cairo', 'CAI', 'السعودية'] },
        { rowNumber: 4, values: ['القاهرة', 'Cairo', 'CAI', 'مصر'] },
      ]),
      states,
    );
    expect(result.valid.map((row) => [row.code, row.stateId])).toEqual([
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
  it('rejects missing, absent active and ambiguous parents without choosing a matching ID arbitrarily', () => {
    const rows = districtImportRows([
      { rowNumber: 2, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] },
      { rowNumber: 3, values: ['الرياض', 'Riyadh', 'RYD', 'Saudi Arabia'] },
      { rowNumber: 4, values: ['جدة', 'Jeddah', 'JED', 'Unknown'] },
    ]);
    const result = validateDistrictImport(rows, [
      ...states.filter((state) => state.id !== 2),
      { id: 3, nameAr: 'Egypt', nameEn: 'Other', code: 'CAI', countryId: 1 },
    ]);
    expect(result.valid).toEqual([]);
    expect(result.rows.map((row) => row.issues[0]?.kind)).toEqual([
      'ambiguousState',
      'unknownState',
      'unknownState',
    ]);
  });
  it('does not reserve duplicate keys for invalid rows and preserves actual spreadsheet row numbers', () => {
    const result = validateDistrictImport(
      districtImportRows([
        { rowNumber: 2, values: ['', 'Cairo', 'CAI', 'Egypt'] },
        { rowNumber: 5, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] },
      ]),
      states,
    );
    expect(result.valid).toHaveLength(1);
    const failed = districtImportFailureRows(
      result.rows,
      new CommandFailure('rejected', 400, { 'districts[0].stateId': 'Parent changed' }),
    );
    expect(failed[0]?.status).toBe('invalid');
    expect(failed[1]).toMatchObject({
      rowNumber: 5,
      status: 'failed',
      issues: [{ field: 'stateName', kind: 'server', message: 'Parent changed' }],
    });
  });
  it('never blames a specific row for a batch-only duplicate or uncertain dispatched result', () => {
    const checked = validateDistrictImport(
      districtImportRows([{ rowNumber: 8, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] }]),
      states,
    );
    expect(
      districtImportFailureRows(
        checked.rows,
        new CommandFailure('rejected', 409, {}, ['District.Duplicated']),
      )[0]?.issues,
    ).toEqual([{ field: null, kind: 'batchRejected' }]);
    expect(
      districtImportFailureRows(checked.rows, new CommandFailure('uncertain', 503))[0],
    ).toMatchObject({ status: 'uncertain', issues: [{ field: null, kind: 'uncertain' }] });
  });
});
