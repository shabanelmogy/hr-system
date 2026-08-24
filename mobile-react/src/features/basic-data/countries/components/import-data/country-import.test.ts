import type { TFunction } from 'i18next';

import { buildCountryImportRows } from './country-import';

const t = ((key: string) => key) as TFunction;

describe('country import mapping', () => {
  it('normalizes valid requests and rejects same-file duplicates', () => {
    const rows = buildCountryImportRows([
      { rowNumber: 2, values: ['مصر', 'Egypt', 'eg', 'egy', '+20', 'egp'] },
      { rowNumber: 3, values: ['مصر الجديدة', 'New Egypt', 'EG', 'NEG', '+21', 'neg'] },
    ], t);
    expect(rows[0]).toMatchObject({ status: 'ready', request: { alpha2Code: 'EG', alpha3Code: 'EGY', currencyCode: 'EGP' } });
    expect(rows[1]).toMatchObject({ status: 'invalid', request: null, error: 'countries.import.duplicate' });
  });

  it('keeps invalid domain rows out of the request batch', () => {
    expect(buildCountryImportRows([{ rowNumber: 2, values: ['Egypt', 'مصر', '', '', '', ''] }], t)[0]).toMatchObject({ status: 'invalid', request: null });
  });
});
