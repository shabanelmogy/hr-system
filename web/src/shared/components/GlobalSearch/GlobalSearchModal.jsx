import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGlobalSearch } from '@/shared/hooks/useGlobalSearch';
import { useNavigate } from 'react-router-dom';
import './GlobalSearchModal.css';

const GlobalSearchModal = ({ 
  isOpen, 
  onClose, 
  onResultSelect,
  maxResults = 20 
}) => {
  const navigate = useNavigate();
  const searchInputRef = useRef(null);
  const modalRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedEntity, setSelectedEntity] = useState('all');

  const {
    searchTerm,
    search,
    clearSearch,
    results,
    hasResults,
    isLoading,
    searchHistory,
    resultsByEntity,
    navigateToResult,
    activeEntities,
    clearHistory,
    removeFromHistory
  } = useGlobalSearch({
    minSearchLength: 1,
    maxResults: 100,
    debounceMs: 200
  });

  // Focus search input when modal opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      const filteredResults = selectedEntity === 'all' 
        ? results.slice(0, maxResults)
        : (resultsByEntity[selectedEntity] || []).slice(0, maxResults);

      switch (e.key) {
        case 'Escape':
          e.preventDefault();
          handleClose();
          break;

        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredResults.length - 1 ? prev + 1 : 0
          );
          break;

        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredResults.length - 1
          );
          break;

        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && filteredResults[selectedIndex]) {
            handleResultClick(filteredResults[selectedIndex]);
          }
          break;

        case 'Tab':
          if (e.shiftKey) {
            // Shift+Tab - previous entity
            e.preventDefault();
            const entities = ['all', ...Object.keys(activeEntities)];
            const currentIndex = entities.indexOf(selectedEntity);
            const prevIndex = currentIndex > 0 ? currentIndex - 1 : entities.length - 1;
            setSelectedEntity(entities[prevIndex]);
            setSelectedIndex(-1);
          } else {
            // Tab - next entity
            e.preventDefault();
            const entities = ['all', ...Object.keys(activeEntities)];
            const currentIndex = entities.indexOf(selectedEntity);
            const nextIndex = currentIndex < entities.length - 1 ? currentIndex + 1 : 0;
            setSelectedEntity(entities[nextIndex]);
            setSelectedIndex(-1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, resultsByEntity, selectedEntity, selectedIndex, maxResults, activeEntities]);

  // Handle modal close
  const handleClose = () => {
    clearSearch();
    setSelectedIndex(-1);
    setSelectedEntity('all');
    onClose();
  };

  // Handle result selection
  const handleResultClick = (result) => {
    const route = navigateToResult(result);
    
    if (onResultSelect) {
      onResultSelect(result, route);
    } else {
      navigate(route);
    }
    
    handleClose();
  };

  // Handle history item click
  const handleHistoryClick = (historyItem) => {
    search(historyItem.term);
  };

  // Handle entity filter change
  const handleEntityChange = (entityType) => {
    setSelectedEntity(entityType);
    setSelectedIndex(-1);
  };

  // Get filtered results based on selected entity
  const getFilteredResults = () => {
    if (selectedEntity === 'all') {
      return results.slice(0, maxResults);
    }
    return (resultsByEntity[selectedEntity] || []).slice(0, maxResults);
  };

  const filteredResults = getFilteredResults();

  if (!isOpen) return null;

  return createPortal(
    <div className="global-search-modal-overlay" onClick={handleClose}>
      <div 
        ref={modalRef}
        className="global-search-modal"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="modal-header">
          <div className="search-input-container">
            <div className="search-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
            </div>
            
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => search(e.target.value)}
              placeholder="Search across all modules..."
              className="modal-search-input"
              autoComplete="off"
            />

            {isLoading && (
              <div className="search-loading">
                <div className="spinner"></div>
              </div>
            )}

            <button
              onClick={handleClose}
              className="close-button"
              type="button"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Entity Filter Tabs */}
          <div className="entity-filters">
            <button
              className={`entity-filter ${selectedEntity === 'all' ? 'active' : ''}`}
              onClick={() => handleEntityChange('all')}
            >
              All Results
              {searchTerm && (
                <span className="result-count">({results.length})</span>
              )}
            </button>
            
            {Object.entries(activeEntities).map(([entityType, config]) => {
              const count = resultsByEntity[entityType]?.length || 0;
              if (!searchTerm || count === 0) return null;
              
              return (
                <button
                  key={entityType}
                  className={`entity-filter ${selectedEntity === entityType ? 'active' : ''}`}
                  onClick={() => handleEntityChange(entityType)}
                >
                  <span className="entity-icon">{config.icon}</span>
                  {config.name}
                  <span className="result-count">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          {!searchTerm ? (
            /* Search History and Tips */
            <div className="search-empty-state">
              {searchHistory.length > 0 && (
                <div className="history-section">
                  <div className="section-header">
                    <h3>Recent Searches</h3>
                    <button 
                      onClick={clearHistory}
                      className="clear-history-btn"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="history-grid">
                    {searchHistory.slice(0, 8).map((item) => (
                      <div
                        key={item.id}
                        className="history-item"
                        onClick={() => handleHistoryClick(item)}
                      >
                        <div className="history-content">
                          <span className="history-term">{item.term}</span>
                          <span className="history-time">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromHistory(item.id);
                          }}
                          className="remove-history-btn"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Tips */}
              <div className="tips-section">
                <h3>Search Tips</h3>
                <div className="tips-grid">
                  <div className="tip-item">
                    <div className="tip-icon">🔍</div>
                    <div className="tip-content">
                      <strong>Global Search</strong>
                      <p>Search across all modules and data types</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">⚡</div>
                    <div className="tip-content">
                      <strong>Quick Navigation</strong>
                      <p>Use ↑↓ arrows and Enter to navigate</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">🏷️</div>
                    <div className="tip-content">
                      <strong>Filter by Type</strong>
                      <p>Use tabs to filter results by entity type</p>
                    </div>
                  </div>
                  <div className="tip-item">
                    <div className="tip-icon">⌨️</div>
                    <div className="tip-content">
                      <strong>Keyboard Shortcuts</strong>
                      <p>Tab/Shift+Tab to switch filters</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="search-results-container">
              {hasResults ? (
                <div className="results-list">
                  {filteredResults.map((result, index) => {
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <div
                        key={`${result._entityType}-${result.id}`}
                        className={`result-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleResultClick(result)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="result-icon">
                          {result._entityConfig.icon}
                        </div>
                        
                        <div className="result-content">
                          <div className="result-title">
                            {result._displayText}
                          </div>
                          <div className="result-meta">
                            <span className="result-type">
                              {result._entityConfig.name}
                            </span>
                            <span className="result-separator">•</span>
                            <span className="result-id">ID: {result.id}</span>
                            {result.createdOn && (
                              <>
                                <span className="result-separator">•</span>
                                <span className="result-date">
                                  {new Date(result.createdOn).toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        
                        <div className="result-actions">
                          <div className="result-arrow">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path d="m9 18 6-6-6-6"/>
                            </svg>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="no-results">
                  <div className="no-results-icon">
                    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <circle cx="11" cy="11" r="8"/>
                      <path d="m21 21-4.35-4.35"/>
                    </svg>
                  </div>
                  <h3>No results found</h3>
                  <p>Try different keywords or check your spelling</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <div className="footer-shortcuts">
            <div className="shortcut-group">
              <kbd>↑</kbd><kbd>↓</kbd>
              <span>Navigate</span>
            </div>
            <div className="shortcut-group">
              <kbd>Enter</kbd>
              <span>Select</span>
            </div>
            <div className="shortcut-group">
              <kbd>Tab</kbd>
              <span>Switch Filter</span>
            </div>
            <div className="shortcut-group">
              <kbd>Esc</kbd>
              <span>Close</span>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GlobalSearchModal;