import React, { useState, useRef, useEffect } from 'react';
import { useGlobalSearch } from '@/shared/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';
import './GlobalSearchBar.css';

const GlobalSearchBar = ({ 
  placeholder = "Search across all modules...",
  showShortcut = true,
  maxDisplayResults = 8,
  className = "",
  onResultSelect,
  ...props 
}) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const resultsRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const {
    searchTerm,
    search,
    clearSearch,
    results,
    hasResults,
    isLoading,
    isSearchFocused,
    setIsSearchFocused,
    searchHistory,
    resultsByEntity,
    navigateToResult,
    activeEntities
  } = useGlobalSearch({
    minSearchLength: 2,
    maxResults: 50,
    debounceMs: 300
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setIsSearchFocused(true);
      }

      // Escape to close search
      if (e.key === 'Escape' && isSearchFocused) {
        clearSearch();
        setIsSearchFocused(false);
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchFocused, clearSearch]);

  // Handle result navigation with arrow keys
  const handleKeyNavigation = (e) => {
    if (!hasResults) return;

    const displayResults = results.slice(0, maxDisplayResults);

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < displayResults.length - 1 ? prev + 1 : 0
        );
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : displayResults.length - 1
        );
        break;
      
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && displayResults[selectedIndex]) {
          handleResultClick(displayResults[selectedIndex]);
        }
        break;
    }
  };

  // Handle result selection
  const handleResultClick = (result) => {
    const route = navigateToResult(result);
    
    if (onResultSelect) {
      onResultSelect(result, route);
    } else {
      navigate(route);
    }
    
    clearSearch();
    setIsSearchFocused(false);
    setSelectedIndex(-1);
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    search(historyItem.term);
    setIsSearchFocused(true);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        searchInputRef.current && 
        !searchInputRef.current.contains(e.target) &&
        resultsRef.current &&
        !resultsRef.current.contains(e.target)
      ) {
        setIsSearchFocused(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(-1);
  }, [results]);

  const displayResults = results.slice(0, maxDisplayResults);
  const hasMoreResults = results.length > maxDisplayResults;

  return (
    <div className={`global-search-container ${className}`} {...props}>
      {/* Search Input */}
      <div className="global-search-input-wrapper">
        <div className="search-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.35-4.35"/>
          </svg>
        </div>
        
        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={(e) => search(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onKeyDown={handleKeyNavigation}
          placeholder={placeholder}
          className="global-search-input"
          autoComplete="off"
        />

        {/* Loading indicator */}
        {isLoading && (
          <div className="search-loading">
            <div className="spinner"></div>
          </div>
        )}

        {/* Clear button */}
        {searchTerm && (
          <button
            onClick={() => {
              clearSearch();
              setSelectedIndex(-1);
            }}
            className="search-clear-btn"
            type="button"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        )}

        {/* Keyboard shortcut hint */}
        {showShortcut && !isSearchFocused && !searchTerm && (
          <div className="search-shortcut">
            <kbd>⌘</kbd><kbd>K</kbd>
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isSearchFocused && (
        <div ref={resultsRef} className="global-search-results">
          {/* Search History */}
          {!searchTerm && searchHistory.length > 0 && (
            <div className="search-section">
              <div className="search-section-header">
                <span>Recent Searches</span>
              </div>
              {searchHistory.slice(0, 5).map((item) => (
                <div
                  key={item.id}
                  className="search-history-item"
                  onClick={() => handleHistoryClick(item)}
                >
                  <div className="history-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6l4-4-4-4"/>
                      <path d="M12 23v-6l-4 4 4 4"/>
                    </svg>
                  </div>
                  <span>{item.term}</span>
                </div>
              ))}
            </div>
          )}

          {/* Search Results */}
          {searchTerm && (
            <>
              {hasResults ? (
                <>
                  {/* Results grouped by entity */}
                  {Object.entries(resultsByEntity).map(([entityType, entityResults]) => {
                    const entityConfig = activeEntities[entityType];
                    if (!entityConfig || entityResults.length === 0) return null;

                    return (
                      <div key={entityType} className="search-section">
                        <div className="search-section-header">
                          <span className="entity-icon">{entityConfig.icon}</span>
                          <span>{entityConfig.name}</span>
                          <span className="result-count">({entityResults.length})</span>
                        </div>
                        
                        {entityResults.slice(0, 3).map((result, index) => {
                          const globalIndex = displayResults.findIndex(r => r === result);
                          const isSelected = globalIndex === selectedIndex;
                          
                          return (
                            <div
                              key={`${result._entityType}-${result.id}`}
                              className={`search-result-item ${isSelected ? 'selected' : ''}`}
                              onClick={() => handleResultClick(result)}
                              onMouseEnter={() => setSelectedIndex(globalIndex)}
                            >
                              <div className="result-content">
                                <div className="result-title">
                                  {result._displayText}
                                </div>
                                <div className="result-subtitle">
                                  {entityConfig.name} • ID: {result.id}
                                </div>
                              </div>
                              <div className="result-arrow">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path d="m9 18 6-6-6-6"/>
                                </svg>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}

                  {/* Show more results indicator */}
                  {hasMoreResults && (
                    <div className="search-more-results">
                      <span>+{results.length - maxDisplayResults} more results</span>
                    </div>
                  )}
                </>
              ) : (
                <div className="search-no-results">
                  <div className="no-results-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <div className="no-results-text">
                    <h3>No results found</h3>
                    <p>Try adjusting your search terms</p>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Quick tips */}
          {!searchTerm && searchHistory.length === 0 && (
            <div className="search-tips">
              <div className="search-tip">
                <strong>Quick Search Tips:</strong>
              </div>
              <div className="search-tip">• Search across all modules</div>
              <div className="search-tip">• Use <kbd>↑</kbd><kbd>↓</kbd> to navigate</div>
              <div className="search-tip">• Press <kbd>Enter</kbd> to select</div>
              <div className="search-tip">• Press <kbd>Esc</kbd> to close</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GlobalSearchBar;