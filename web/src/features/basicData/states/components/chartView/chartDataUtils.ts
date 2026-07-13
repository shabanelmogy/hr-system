import { State } from "../../types/State";

export interface CountryData {
  name: string;
  value: number;
  nameAr?: string;
}

export interface StateDistributionData {
  name: string;
  value: number;
}

export interface TimelineData {
  month: string;
  count: number;
  cumulative: number;
}

export const prepareCountryData = (states: State[]): CountryData[] => {
  const countries: Record<string, { count: number; nameAr?: string }> = {};

  states.forEach((state: State) => {
    if (state.country) {
      const countryName = state.country.nameEn;
      if (!countries[countryName]) {
        countries[countryName] = { count: 0, nameAr: state.country.nameAr };
      }
      countries[countryName].count += 1;
    }
  });

  return Object.entries(countries)
    .map(([name, data]) => ({ 
      name, 
      value: data.count,
      nameAr: data.nameAr 
    }))
    .sort((a, b) => b.value - a.value);
};

export const prepareStateDistributionData = (states: State[]): StateDistributionData[] => {
  const distribution: Record<string, number> = {};

  states.forEach((state) => {
    // Group by first letter of state name for distribution analysis
    const firstLetter = state.nameEn?.charAt(0)?.toUpperCase() || 'Unknown';
    const group = `${firstLetter} States`;
    
    distribution[group] = (distribution[group] || 0) + 1;
  });

  return Object.entries(distribution).map(([name, value]) => ({ name, value }));
};

export const prepareTimelineData = (states: State[]): TimelineData[] => {
  const timeline: Record<string, number> = {};

  states.forEach((state) => {
    if (state.createdOn) {
      const month = new Date(state.createdOn).toISOString().slice(0, 7); // YYYY-MM
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

import { getColorPalette } from '../../../../../shared/components/charts/chartUtils';

export const getChartColors = (): string[] => getColorPalette('rainbow', 'light');