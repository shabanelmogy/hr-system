import { normalizeOrganizationalStructureRequest } from './organizational-structure-request-policy';

describe('organizational structure request policy', () => {
  it('preserves the existing wire normalization rules', () => {
    expect(normalizeOrganizationalStructureRequest({
      code: ' br-01 ',
      nameEn: ' Cairo Branch ',
      nameAr: ' فرع القاهرة ',
      version: ' v2 ',
      currencyCode: ' egp ',
      costCenterCode: ' cc-10 ',
    })).toMatchObject({
      code: 'BR-01',
      nameEn: 'Cairo Branch',
      nameAr: 'فرع القاهرة',
      version: 'V2',
      currencyCode: 'EGP',
      costCenterCode: 'CC-10',
    });
  });
});
