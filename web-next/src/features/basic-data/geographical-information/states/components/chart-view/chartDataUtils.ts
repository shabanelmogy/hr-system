import { getColorPalette } from "@/shared/components/charts";
import type { StateListItem } from "../../types/State";

export interface CountryData {
  name: string;
  value: number;
}

export interface DistrictData {
  name: string;
  value: number;
}

export interface TimelineData {
  month: string;
  count: number;
  cumulative: number;
}

const usesArabicNames = (language?: string): boolean =>
  language?.toLowerCase().startsWith("ar") ?? false;

export const prepareCountryData = (
  states: StateListItem[],
  language?: string,
): CountryData[] => {
  const countries = new Map<number, CountryData>();
  const useArabicName = usesArabicNames(language);

  states.forEach((state) => {
    const current = countries.get(state.country.id);
    if (current) {
      current.value += 1;
      return;
    }

    countries.set(state.country.id, {
      name: useArabicName ? state.country.nameAr : state.country.nameEn,
      value: 1,
    });
  });

  return [...countries.values()].sort((left, right) => right.value - left.value);
};

export const prepareDistrictData = (
  states: StateListItem[],
  language?: string,
): DistrictData[] => {
  const useArabicName = usesArabicNames(language);

  return states
    .map((state) => ({
      name: useArabicName ? state.nameAr : state.nameEn,
      value: state.districtsCount,
    }))
    .filter((state) => state.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 10);
};

export const prepareTimelineData = (states: StateListItem[]): TimelineData[] => {
  const timeline: Record<string, number> = {};

  states.forEach((state) => {
    const createdOn = new Date(state.createdOn);
    if (Number.isNaN(createdOn.getTime())) return;

    const month = createdOn.toISOString().slice(0, 7);
    timeline[month] = (timeline[month] ?? 0) + 1;
  });

  let cumulative = 0;
  return Object.entries(timeline)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, count]) => {
      cumulative += count;
      return { month, count, cumulative };
    });
};

export const getChartColors = (mode: "light" | "dark"): string[] =>
  getColorPalette("rainbow", mode);
