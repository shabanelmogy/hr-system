import type { TFunction } from 'i18next';
import { buildAddressTypeImportRows } from './address-type-import';
const t = ((key: string) => key) as TFunction;
describe('Address Type native import mapping', () => {
  it('normalizes valid rows and rejects independent name duplicates', () => {
    const rows = buildAddressTypeImportRows([{ rowNumber: 2, values: ['منزل', 'Home'] }, { rowNumber: 3, values: ['عمل', 'home'] }], t);
    expect(rows[0]).toMatchObject({ status: 'ready', request: { nameAr: 'منزل', nameEn: 'Home' } }); expect(rows[1]).toMatchObject({ status: 'invalid', request: null, error: 'addressTypes.import.duplicate' });
  });
  it('accepts localized values in either display-name field', () => { expect(buildAddressTypeImportRows([{ rowNumber: 2, values: ['Home', 'منزل'] }], t)[0]).toMatchObject({ status: 'ready', request: { nameAr: 'Home', nameEn: 'منزل' } }); });
});
