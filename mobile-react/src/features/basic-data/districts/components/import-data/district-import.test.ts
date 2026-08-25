import type { TFunction } from 'i18next';

import { buildDistrictImportRows } from './district-import';

const t = ((key: string) => key) as TFunction;
const states = [
  { id: 7, nameAr: 'القاهرة', nameEn: 'Cairo' },
  { id: 8, nameAr: 'الجيزة', nameEn: 'Giza' },
];

describe('district import mapping', () => {
  it('resolves Arabic or English state names and scopes same-field duplicates to the state', () => {
    const rows = buildDistrictImportRows([
      { rowNumber: 2, values: ['المعادي', 'Maadi', 'maa', 'Cairo'] },
      { rowNumber: 3, values: ['مدينة نصر', 'Nasr City', 'MAA', 'القاهرة'] },
      { rowNumber: 4, values: ['الدقي', 'Dokki', 'MAA', 'Giza'] },
    ], states, t);

    expect(rows[0]).toMatchObject({ status: 'ready', request: { stateId: 7, code: 'MAA' } });
    expect(rows[1]).toMatchObject({ status: 'invalid', request: null, error: 'districts.import.duplicate' });
    expect(rows[2]).toMatchObject({ status: 'ready', request: { stateId: 8, code: 'MAA' } });
  });

  it('allows equal normalized text across different fields', () => {
    const rows = buildDistrictImportRows([
      { rowNumber: 2, values: ['المعادي', 'Cairo', 'GIZ', 'Cairo'] },
      { rowNumber: 3, values: ['مدينة نصر', 'Giza', 'CAIRO', 'Cairo'] },
    ], states, t);

    expect(rows).toEqual(expect.arrayContaining([
      expect.objectContaining({ status: 'ready' }),
      expect.objectContaining({ status: 'ready' }),
    ]));
  });

  it('rejects unknown or ambiguous active state names locally', () => {
    expect(buildDistrictImportRows([
      { rowNumber: 2, values: ['المعادي', 'Maadi', 'MAA', 'Unknown'] },
    ], states, t)[0]).toMatchObject({ status: 'invalid', request: null });

    expect(buildDistrictImportRows([
      { rowNumber: 2, values: ['المعادي', 'Maadi', 'MAA', 'Cairo'] },
    ], [...states, { id: 9, nameAr: 'محافظة', nameEn: 'Cairo' }], t)[0]).toMatchObject({ status: 'invalid', request: null });
  });
});
