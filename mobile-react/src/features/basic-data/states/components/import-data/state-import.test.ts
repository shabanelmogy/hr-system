import type { TFunction } from 'i18next';

import { buildStateImportRows } from './state-import';

const t = ((key: string) => key) as TFunction;
const countries = [{ id: 7, nameAr: 'مصر', nameEn: 'Egypt', isDeleted: false }];

describe('state import mapping', () => {
  it('resolves Arabic or English country names and scopes duplicates to the country', () => {
    const rows = buildStateImportRows([
      { rowNumber: 2, values: ['القاهرة', 'Cairo', 'cai', 'Egypt'] },
      { rowNumber: 3, values: ['القاهرة الجديدة', 'New Cairo', 'CAI', 'مصر'] },
    ], countries, t);
    expect(rows[0]).toMatchObject({ status: 'ready', request: { countryId: 7, code: 'CAI' } });
    expect(rows[1]).toMatchObject({ status: 'invalid', request: null, error: 'states.import.duplicate' });
  });

  it('rejects unknown or inactive countries locally', () => {
    expect(buildStateImportRows([{ rowNumber: 2, values: ['القاهرة', 'Cairo', 'CAI', 'Unknown'] }], countries, t)[0]).toMatchObject({ status: 'invalid', request: null });
    expect(buildStateImportRows([{ rowNumber: 2, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] }], [{ ...countries[0], isDeleted: true }], t)[0]).toMatchObject({ status: 'invalid', request: null });
    expect(buildStateImportRows([{ rowNumber: 2, values: ['القاهرة', 'Cairo', 'CAI', 'Egypt'] }], [...countries, { id: 8, nameAr: 'بلد', nameEn: 'Egypt', isDeleted: false }], t)[0]).toMatchObject({ status: 'invalid', request: null });
  });
});
