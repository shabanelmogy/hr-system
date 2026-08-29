import { getNextMockSample } from '@/src/shared/utils/mockData';
import type { AddressTypeRequest } from '../types/address-type';

const samples: readonly AddressTypeRequest[] = [
  { nameAr: 'منزل', nameEn: 'Home' },
  { nameAr: 'عمل', nameEn: 'Work' },
  { nameAr: 'رئيسي', nameEn: 'Primary' },
  { nameAr: 'شحن', nameEn: 'Shipping' },
];

export function getNextAddressTypeMockData(usedIndexes: Set<number>): AddressTypeRequest {
  return { ...getNextMockSample(samples, usedIndexes) };
}
