import { getColorPalette } from "@/shared/components/charts";
import type { DistrictListItem } from "../../types/District";

export interface StateData {
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

export const prepareStateData = (
  districts: DistrictListItem[],
  language?: string,
): StateData[] => {
  const states = new Map<number, StateData>();
  const useArabicName = usesArabicNames(language);

  districts.forEach((state) => {
    const current = states.get(state.state.id);
    if (current) {
      current.value += 1;
      return;
    }

    states.set(state.state.id, {
      name: useArabicName ? state.state.nameAr : state.state.nameEn,
      value: 1,
    });
  });

  return [...states.values()].sort((left, right) => right.value - left.value);
};

export const prepareDistrictData = (
  districts: DistrictListItem[],
  language?: string,
): DistrictData[] => {
  const useArabicName = usesArabicNames(language);

  return districts
    .map((state) => ({
      name: useArabicName ? state.nameAr : state.nameEn,
      value: state.addressesCount,
    }))
    .filter((state) => state.value > 0)
    .sort((left, right) => right.value - left.value)
    .slice(0, 10);
};

export const prepareTimelineData = (districts: DistrictListItem[]): TimelineData[] => {
  const timeline: Record<string, number> = {};

  districts.forEach((state) => {
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
