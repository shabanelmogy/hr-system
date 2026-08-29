import { getNextMockSample } from '@/src/shared/utils/mockData';
import type { StateRequest } from '../types/state';

const samples: readonly Omit<StateRequest, 'countryId'>[] = [
  { nameAr: 'القاهرة', nameEn: 'Cairo', code: 'CAI' },
  { nameAr: 'الجيزة', nameEn: 'Giza', code: 'GIZ' },
  { nameAr: 'الإسكندرية', nameEn: 'Alexandria', code: 'ALX' },
  { nameAr: 'الشرقية', nameEn: 'Sharqia', code: 'SHR' },
];

export function getNextStateMockData(usedIndexes: Set<number>, countryId: number): StateRequest {
  return { ...getNextMockSample(samples, usedIndexes), countryId };
}
