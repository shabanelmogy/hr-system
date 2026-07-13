import { AddressType } from "../../types/AddressType";

export const prepareInitialLetterData = (addressTypes: AddressType[]): InitialLetterData[] => {
  const counts: Record<string, number> = {};
  
  addressTypes.forEach((addressType) => {
    const first = (addressType.nameEn || addressType.nameAr || "?").trim().charAt(0).toUpperCase() || "?";
    const key = /[A-Z]/.test(first) ? first : "?";
    counts[key] = (counts[key] || 0) + 1;
  });
  
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const prepareTimelineData = (addressTypes: AddressType[]): TimelineData[] => {
  const timeline: Record<string, number> = {};
  
  addressTypes.forEach((addressType) => {
    if (addressType.createdOn) {
      const month = new Date(addressType.createdOn).toISOString().slice(0, 7); // YYYY-MM
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

export const prepareLanguageData = (addressTypes: AddressType[]): LanguageData[] => {
  let arabicOnly = 0;
  let englishOnly = 0;
  let both = 0;
  let neither = 0;
  
  addressTypes.forEach((addressType) => {
    const hasArabic = addressType.nameAr && addressType.nameAr.trim().length > 0;
    const hasEnglish = addressType.nameEn && addressType.nameEn.trim().length > 0;
    
    if (hasArabic && hasEnglish) {
      both++;
    } else if (hasArabic) {
      arabicOnly++;
    } else if (hasEnglish) {
      englishOnly++;
    } else {
      neither++;
    }
  });
  
  return [
    { name: "Both Languages", value: both },
    { name: "Arabic Only", value: arabicOnly },
    { name: "English Only", value: englishOnly },
    { name: "Neither", value: neither },
  ].filter(item => item.value > 0);
};

export const prepareNameLengthData = (addressTypes: AddressType[]): LengthData[] => {
  const lengths: Record<string, number> = {};
  
  addressTypes.forEach((addressType) => {
    const nameLength = Math.max(
      addressType.nameAr?.length || 0,
      addressType.nameEn?.length || 0
    );
    
    let category: string;
    if (nameLength <= 5) {
      category = "Short (≤5)";
    } else if (nameLength <= 10) {
      category = "Medium (6-10)";
    } else if (nameLength <= 15) {
      category = "Long (11-15)";
    } else {
      category = "Very Long (>15)";
    }
    
    lengths[category] = (lengths[category] || 0) + 1;
  });
  
  return Object.entries(lengths)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => {
      const order = ["Short (≤5)", "Medium (6-10)", "Long (11-15)", "Very Long (>15)"];
      return order.indexOf(a.name) - order.indexOf(b.name);
    });
};

// Utility function to get address types with complete data
export const getCompleteAddressTypes = (addressTypes: AddressType[]): number => {
  return addressTypes.filter(addressType => 
    addressType.nameAr && 
    addressType.nameEn && 
    addressType.nameAr.trim().length > 0 && 
    addressType.nameEn.trim().length > 0
  ).length;
};

// Utility function to get address types created in the last 30 days
export const getRecentAddressTypes = (addressTypes: AddressType[]): number => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return addressTypes.filter(addressType => {
    if (!addressType.createdOn) return false;
    return new Date(addressType.createdOn) >= thirtyDaysAgo;
  }).length;
};

import { getColorPalette } from '../../../../../shared/components/charts/chartUtils';
import { InitialLetterData, LanguageData, LengthData, TimelineData } from "./AddressTypeChart.types";

export const getChartColors = (): string[] => getColorPalette('rainbow', 'light');