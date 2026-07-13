import { useState, useCallback } from 'react';

export const useGlobalSearch = (options: any = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchHistory, setSearchHistory] = useState<any[]>([]);
  const [resultsByEntity, setResultsByEntity] = useState<any>({});
  const [activeEntities, setActiveEntities] = useState<any>({});

  const performSearch = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);
    
    try {
      // Mock search results for now
      const mockResults = [
        { id: 1, title: 'Countries', type: 'basic-data', url: '/basic-data/countries' },
        { id: 2, title: 'States', type: 'basic-data', url: '/basic-data/states' },
      ];
      
      setSearchResults(mockResults);
      setResultsByEntity({ 'all': mockResults });
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setResultsByEntity({});
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
    setResultsByEntity({});
  }, []);

  const navigateToResult = useCallback((result: any) => {
    return result.url || '/';
  }, []);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  const removeFromHistory = useCallback((id: any) => {
    setSearchHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    searchResults,
    hasSearched,
    performSearch,
    clearSearch,
    search: performSearch,
    results: searchResults,
    hasResults: searchResults.length > 0,
    isLoading: isSearching,
    isSearchFocused,
    setIsSearchFocused,
    searchHistory,
    resultsByEntity,
    navigateToResult,
    activeEntities,
    clearHistory,
    removeFromHistory
  };
};

export const useSimpleGlobalSearch = () => {
  const [query, setQuery] = useState('');
  return { query, setQuery };
};

export const useEntitySearch = () => {
  const [entities, setEntities] = useState<any[]>([]);
  return { entities, setEntities };
};
