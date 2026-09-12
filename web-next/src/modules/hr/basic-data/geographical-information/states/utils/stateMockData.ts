import { getNextMockSample } from "@/shared/utils/mockData";
import type { StateFormData } from "../types/State";

const stateMockSamples: readonly Omit<StateFormData, "countryId">[] = [
  { nameAr: "القاهرة", nameEn: "Cairo", code: "CAI" },
  { nameAr: "الجيزة", nameEn: "Giza", code: "GIZ" },
  { nameAr: "الإسكندرية", nameEn: "Alexandria", code: "ALX" },
  { nameAr: "الدقهلية", nameEn: "Dakahlia", code: "DKH" },
  { nameAr: "الشرقية", nameEn: "Sharqia", code: "SHR" },
  { nameAr: "أسوان", nameEn: "Aswan", code: "ASW" },
];

export function getNextStateMockData(
  usedIndexes: Set<number>,
  countryId: number,
  random: () => number = Math.random,
): StateFormData {
  return {
    ...getNextMockSample(stateMockSamples, usedIndexes, random),
    countryId,
  };
}
