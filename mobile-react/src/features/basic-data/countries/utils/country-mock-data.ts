import { getNextMockSample } from '@/src/shared/utils/mockData';
import type { CountryRequest } from '../types/country';

const samples: readonly CountryRequest[] = [
  { nameAr: 'مصر', nameEn: 'Egypt', alpha2Code: 'EG', alpha3Code: 'EGY', phoneCode: '20', currencyCode: 'EGP' },
  { nameAr: 'السعودية', nameEn: 'Saudi Arabia', alpha2Code: 'SA', alpha3Code: 'SAU', phoneCode: '966', currencyCode: 'SAR' },
  { nameAr: 'الإمارات', nameEn: 'United Arab Emirates', alpha2Code: 'AE', alpha3Code: 'ARE', phoneCode: '971', currencyCode: 'AED' },
  { nameAr: 'الأردن', nameEn: 'Jordan', alpha2Code: 'JO', alpha3Code: 'JOR', phoneCode: '962', currencyCode: 'JOD' },
];

export function getNextCountryMockData(usedIndexes: Set<number>): CountryRequest {
  return { ...getNextMockSample(samples, usedIndexes) };
}
