import {
  normalizeAddressTypeRequest,
  normalizeAddressTypeRequests,
} from './address-type-request-policy';

describe('address type request policy', () => {
  it('trims localized names consistently', () => {
    expect(normalizeAddressTypeRequest({ nameAr: ' منزل ', nameEn: ' Home ' })).toEqual({
      nameAr: 'منزل',
      nameEn: 'Home',
    });
    expect(normalizeAddressTypeRequests([{ nameAr: ' عمل ', nameEn: ' Work ' }])).toEqual([
      { nameAr: 'عمل', nameEn: 'Work' },
    ]);
  });
});
