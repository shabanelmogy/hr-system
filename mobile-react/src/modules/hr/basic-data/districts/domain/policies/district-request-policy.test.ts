import { normalizeDistrictRequest } from './district-request-policy';

describe('district request policy', () => {
  it('normalizes names, code, and state id', () => {
    expect(normalizeDistrictRequest({ nameAr: ' المعادي ', nameEn: ' Maadi ', code: 'maa', stateId: 7 })).toEqual({
      nameAr: 'المعادي',
      nameEn: 'Maadi',
      code: 'MAA',
      stateId: 7,
    });
  });
});
