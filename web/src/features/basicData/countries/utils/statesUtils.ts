import { SimpleState } from '../types/Country';

// Utility function to filter active states from a country
export const getActiveStates = (states: SimpleState[] = []): SimpleState[] => {
  return states.filter(state => !state.isDeleted);
};

// Utility function to get states count for a country
export const getStatesCount = (states: SimpleState[] = [], includeDeleted: boolean = false): number => {
  if (includeDeleted) {
    return states.length;
  }
  return getActiveStates(states).length;
};

// Utility function to get states display text
export const getStatesDisplayText = (states: SimpleState[] = [], t: (key: string) => string): string => {
  const activeStates = getActiveStates(states);
  const count = activeStates.length;
  
  if (count === 0) {
    return t('countries.noStates') || 'No states';
  }
  
  if (count === 1) {
    return `1 ${t('countries.state') || 'state'}`;
  }
  
  return `${count} ${t('countries.states') || 'states'}`;
};

// Utility function to format states list for display
export const formatStatesForDisplay = (states: SimpleState[] = [], maxDisplay: number = 3): {
  displayStates: SimpleState[];
  hasMore: boolean;
  moreCount: number;
} => {
  const activeStates = getActiveStates(states);
  
  if (activeStates.length <= maxDisplay) {
    return {
      displayStates: activeStates,
      hasMore: false,
      moreCount: 0,
    };
  }
  
  return {
    displayStates: activeStates.slice(0, maxDisplay),
    hasMore: true,
    moreCount: activeStates.length - maxDisplay,
  };
};

// Utility function to search states within a country
export const searchCountryStates = (states: SimpleState[], searchTerm: string): SimpleState[] => {
  if (!searchTerm.trim()) {
    return getActiveStates(states);
  }

  const term = searchTerm.toLowerCase().trim();
  const activeStates = getActiveStates(states);
  
  return activeStates.filter((state) => {
    return (
      state.nameEn?.toLowerCase().includes(term) ||
      state.nameAr?.includes(term) ||
      state.code?.toLowerCase().includes(term)
    );
  });
};