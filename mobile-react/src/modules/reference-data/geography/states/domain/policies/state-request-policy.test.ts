import { normalizeStateRequest, normalizeStateRequests } from './state-request-policy';

describe('state request policy', () => {
  it('normalizes names, code, and country id without transport concerns', () => {
    expect(normalizeStateRequest({
      nameAr: ' القاهرة ',
      nameEn: ' Cairo ',
      code: ' cai ',
      countryId: 7,
    })).toEqual({ nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI', countryId: 7 });
  });

  it('normalizes bulk requests independently', () => {
    expect(normalizeStateRequests([
      { nameAr: ' الجيزة ', nameEn: ' Giza ', code: ' giz ', countryId: 7 },
    ])).toEqual([{ nameAr: 'الجيزة', nameEn: 'Giza', code: 'GIZ', countryId: 7 }]);
  });
});
