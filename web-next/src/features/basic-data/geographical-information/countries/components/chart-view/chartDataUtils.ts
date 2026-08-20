import type { CountryListItem } from "../../types/Country";
import { getColorPalette } from "@/shared/components/charts/palette";

export interface CurrencyData {
  name: string;
  value: number;
}

export interface TimelineData {
  month: string;
  count: number;
  cumulative: number;
}

export interface StatesData {
  name: string;
  statesCount: number;
}

export interface StatesCoverageData {
  name: string;
  value: number;
}

export const prepareCurrencyData = (countries: CountryListItem[]): CurrencyData[] => {
  const currencies: Record<string, number> = {};

  countries.forEach((country) => {
    if (country.currencyCode) {
      currencies[country.currencyCode] = (currencies[country.currencyCode] || 0) + 1;
    }
  });

  return Object.entries(currencies)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => (b.value as number) - (a.value as number))
    .slice(0, 10); // Top 10 currencies
};

export const prepareTimelineData = (countries: CountryListItem[]): TimelineData[] => {
  const timeline: Record<string, number> = {};

  countries.forEach((country) => {
    if (country.createdOn) {
      const createdOn = new Date(country.createdOn);
      if (Number.isNaN(createdOn.getTime())) return;
      const month = createdOn.toISOString().slice(0, 7);
      timeline[month] = (timeline[month] || 0) + 1;
    }
  });

  return Object.entries(timeline)
    .map(([month, count]) => ({ month, count: count as number, cumulative: 0 }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item, index, array) => ({
      ...item,
      cumulative: array.slice(0, index + 1).reduce((sum, curr) => sum + curr.count, 0),
    }));
};

export const prepareStatesData = (
  countries: CountryListItem[],
  language?: string,
): StatesData[] => {
  const useArabicName = language?.toLowerCase().startsWith("ar") ?? false;
  return countries
    .map((country) => ({
      name: useArabicName ? country.nameAr : country.nameEn,
      statesCount: country.statesCount,
    }))
    .filter((item) => item.statesCount > 0)
    .sort((a, b) => b.statesCount - a.statesCount)
    .slice(0, 10); // Top 10 countries with most states
};

export const getTotalStatesCount = (countries: CountryListItem[]): number => {
  return countries.reduce((total, country) => {
    return total + country.statesCount;
  }, 0);
};

export const prepareStatesCoverageData = (
  countries: CountryListItem[],
  labels: { withStates: string; withoutStates: string },
): StatesCoverageData[] => {
  const withStates = countries.filter((country) => country.statesCount > 0).length;
  return [
    { name: labels.withStates, value: withStates },
    { name: labels.withoutStates, value: countries.length - withStates },
  ];
};

export const getChartColors = (mode: "light" | "dark"): string[] =>
  getColorPalette("rainbow", mode);
