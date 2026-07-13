import { Country } from "../../types/Country";
import { getActiveStates, getStatesCount } from "../../utils/statesUtils";
import { getColorPalette } from '../../../../../shared/components/charts/chartUtils';

export interface RegionData {
  name: string;
  value: number;
}

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
  totalStates: number;
}

export const prepareRegionData = (countries: Country[]): RegionData[] => {
  const regions: Record<string, number> = {};

  countries.forEach((country: Country) => {
    // Group by first digit of phone code — loosely maps to geographic zones
    // (1=North America, 2=Africa, 3-4=Europe, 5=Central/South America,
    //  6=Oceania/SE Asia, 7=Russia/CIS, 8=East Asia, 9=Middle East/South Asia)
    const phonePrefix = country.phoneCode?.trim().replace(/^\+/, "").charAt(0);
    const region = phonePrefix
      ? `Zone ${phonePrefix}`
      : "Unknown";

    regions[region] = (regions[region] || 0) + 1;
  });

  return Object.entries(regions)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const prepareCurrencyData = (countries: Country[]): CurrencyData[] => {
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

export const prepareTimelineData = (countries: Country[]): TimelineData[] => {
  const timeline: Record<string, number> = {};

  countries.forEach((country) => {
    if (country.createdOn) {
      const month = new Date(country.createdOn).toISOString().slice(0, 7); // YYYY-MM
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

export const prepareStatesData = (countries: Country[]): StatesData[] => {
  return countries
    .map((country) => ({
      name: country.nameEn || 'Unknown',
      statesCount: getStatesCount(country.states),
      totalStates: country.states?.length || 0,
    }))
    .filter((item) => item.statesCount > 0)
    .sort((a, b) => b.statesCount - a.statesCount)
    .slice(0, 10); // Top 10 countries with most states
};

// Utility function to calculate total states across all countries
export const getTotalStatesCount = (countries: Country[]): number => {
  return countries.reduce((total, country) => {
    return total + getStatesCount(country.states);
  }, 0);
};

// Utility function to get countries with states vs without states
export const getCountriesStatesDistribution = (countries: Country[]): {
  withStates: number;
  withoutStates: number;
} => {
  let withStates = 0;
  let withoutStates = 0;

  countries.forEach((country) => {
    if (getStatesCount(country.states) > 0) {
      withStates++;
    } else {
      withoutStates++;
    }
  });

  return { withStates, withoutStates };
};

export const getChartColors = (): string[] => getColorPalette('rainbow', 'light');