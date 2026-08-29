import { getNextMockSample } from '@/src/shared/utils/mockData';
import type { DistrictRequest } from '../types/district';

const samples: readonly Omit<DistrictRequest, 'stateId'>[] = [
  { nameAr: 'مدينة نصر', nameEn: 'Nasr City', code: 'NSR' },
  { nameAr: 'المعادي', nameEn: 'Maadi', code: 'MAA' },
  { nameAr: 'الدقي', nameEn: 'Dokki', code: 'DOK' },
  { nameAr: 'سموحة', nameEn: 'Smouha', code: 'SMH' },
];

export function getNextDistrictMockData(usedIndexes: Set<number>, stateId: number): DistrictRequest {
  return { ...getNextMockSample(samples, usedIndexes), stateId };
}
