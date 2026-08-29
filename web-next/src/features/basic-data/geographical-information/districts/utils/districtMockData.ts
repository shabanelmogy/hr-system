import { getNextMockSample } from "@/shared/utils/mockData";
import type { DistrictFormData } from "../types/District";

const districtMockSamples: readonly Omit<DistrictFormData, "stateId">[] = [
  { nameAr: "مدينة نصر", nameEn: "Nasr City", code: "NSR" },
  { nameAr: "المعادي", nameEn: "Maadi", code: "MAA" },
  { nameAr: "الدقي", nameEn: "Dokki", code: "DOK" },
  { nameAr: "العجوزة", nameEn: "Agouza", code: "AGO" },
  { nameAr: "سموحة", nameEn: "Smouha", code: "SMH" },
  { nameAr: "المهندسين", nameEn: "Mohandessin", code: "MOH" },
];

export function getNextDistrictMockData(
  usedIndexes: Set<number>,
  stateId: number,
  random: () => number = Math.random,
): DistrictFormData {
  return {
    ...getNextMockSample(districtMockSamples, usedIndexes, random),
    stateId,
  };
}
