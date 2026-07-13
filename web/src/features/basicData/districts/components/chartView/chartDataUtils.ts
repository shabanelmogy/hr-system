import { District } from '../../types/District';

// Chart colors
export const getChartColors = () => [
  '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00',
  '#0088fe', '#00c49f', '#ffbb28', '#ff8042', '#8dd1e1',
  '#d084d0', '#87d068', '#ffc0cb', '#dda0dd', '#98fb98'
];

// Prepare data for districts by state
export const prepareStateData = (districts: District[]) => {
  const stateMap = new Map<string, number>();
  
  districts.forEach(district => {
    if (district.state) {
      const stateName = district.state.nameEn || district.state.nameAr || 'Unknown State';
      stateMap.set(stateName, (stateMap.get(stateName) || 0) + 1);
    }
  });

  return Array.from(stateMap.entries())
    .map(([name, count]) => ({ name, count, value: count }))
    .sort((a, b) => b.count - a.count);
};

// Prepare data for district codes analysis
export const prepareDistrictCodeData = (districts: District[]) => {
  const codeMap = new Map<string, number>();
  
  districts.forEach(district => {
    if (district.code) {
      const codePrefix = district.code.substring(0, 2).toUpperCase();
      codeMap.set(codePrefix, (codeMap.get(codePrefix) || 0) + 1);
    }
  });

  return Array.from(codeMap.entries())
    .map(([prefix, count]) => ({ name: `${prefix}*`, count, value: count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 code prefixes
};

// Prepare timeline data based on creation dates
export const prepareTimelineData = (districts: District[]) => {
  const monthMap = new Map<string, number>();
  
  districts.forEach(district => {
    if (district.createdOn) {
      const date = new Date(district.createdOn);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthMap.set(monthKey, (monthMap.get(monthKey) || 0) + 1);
    }
  });

  return Array.from(monthMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12); // Last 12 months
};

// Get total districts count
export const getTotalDistrictsCount = (districts: District[]) => {
  return districts.length;
};

// Get unique states count
export const getUniqueStatesCount = (districts: District[]) => {
  const uniqueStates = new Set();
  districts.forEach(district => {
    if (district.state?.id) {
      uniqueStates.add(district.state.id);
    }
  });
  return uniqueStates.size;
};

// Get districts with codes count
export const getDistrictsWithCodesCount = (districts: District[]) => {
  return districts.filter(district => district.code && district.code.trim() !== '').length;
};

// Get active districts count
export const getActiveDistrictsCount = (districts: District[]) => {
  return districts.filter(district => !district.isDeleted).length;
};

// Calculate average districts per state
export const getAverageDistrictsPerState = (districts: District[]) => {
  const uniqueStatesCount = getUniqueStatesCount(districts);
  return uniqueStatesCount > 0 ? Math.round(districts.length / uniqueStatesCount) : 0;
};