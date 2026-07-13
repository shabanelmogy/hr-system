import { useState, useCallback } from 'react';

export const useGlobalSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const performSearch = useCallback(async (term) => {
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
        { id: 1, title: 'Sample Result 1', type: 'employee', url: '/employees/1' },
        { id: 2, title: 'Sample Result 2', type: 'document', url: '/documents/2' },
      ];
      
      setSearchResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setSearchResults([]);
    setHasSearched(false);
  }, []);

  return {
    searchTerm,
    setSearchTerm,
    isSearching,
    searchResults,
    hasSearched,
    performSearch,
    clearSearch,
  };
};

export const useSimpleGlobalSearch = () => {
  const [query, setQuery] = useState('');
  return { query, setQuery };
};

export const useEntitySearch = () => {
  const [entities, setEntities] = useState([]);
  return { entities, setEntities };
};
