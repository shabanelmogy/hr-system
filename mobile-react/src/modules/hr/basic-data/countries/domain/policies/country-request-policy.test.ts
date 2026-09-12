import {
  normalizeCountryRequest,
  normalizeCountryRequests,
} from './country-request-policy';

describe('country request policy', () => {
  it('normalizes mutable values without transport dependencies', () => {
    expect(normalizeCountryRequest({
      nameAr: ' مصر ',
      nameEn: ' Egypt ',
      alpha2Code: ' eg ',
      alpha3Code: ' egy ',
      phoneCode: ' +20 ',
      currencyCode: ' egp ',
    })).toEqual({
      nameAr: 'مصر',
      nameEn: 'Egypt',
      alpha2Code: 'EG',
      alpha3Code: 'EGY',
      phoneCode: '+20',
      currencyCode: 'EGP',
    });
  });

  it('converts blank optional values to null for single and bulk requests', () => {
    const request = {
      nameAr: ' مصر ',
      nameEn: ' Egypt ',
      alpha2Code: ' ',
      alpha3Code: null,
      phoneCode: '',
      currencyCode: '   ',
    };

    const expected = {
      nameAr: 'مصر',
      nameEn: 'Egypt',
      alpha2Code: null,
      alpha3Code: null,
      phoneCode: null,
      currencyCode: null,
    };

    expect(normalizeCountryRequest(request)).toEqual(expected);
    expect(normalizeCountryRequests([request])).toEqual([expected]);
  });
});
