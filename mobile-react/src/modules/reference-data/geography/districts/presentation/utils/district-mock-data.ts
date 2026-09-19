import { getNextMockSample } from '@/src/shared/utils/mockData';
import type { DistrictRequest } from '../../domain/models/district';

const samples: readonly Omit<DistrictRequest, 'stateId'>[] = [
  { nameAr: 'Ù…Ø¯ÙŠÙ†Ø© Ù†ØµØ±', nameEn: 'Nasr City', code: 'NSR' },
  { nameAr: 'Ø§Ù„Ù…Ø¹Ø§Ø¯ÙŠ', nameEn: 'Maadi', code: 'MAA' },
  { nameAr: 'Ø§Ù„Ø¯Ù‚ÙŠ', nameEn: 'Dokki', code: 'DOK' },
  { nameAr: 'Ø³Ù…ÙˆØ­Ø©', nameEn: 'Smouha', code: 'SMH' },
];

export function getNextDistrictMockData(usedIndexes: Set<number>, stateId: number): DistrictRequest {
  return { ...getNextMockSample(samples, usedIndexes), stateId };
}
