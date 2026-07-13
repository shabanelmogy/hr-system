import React, { useState } from 'react';
import { 
  GlobalSearchBar, 
  GlobalSearchModal, 
  useGlobalSearch,
  useSimpleGlobalSearch,
  useEntitySearch 
} from './index';

/**
 * Example 1: Basic Global Search Bar
 * Simple search bar that can be placed in header/navbar
 */
export const BasicSearchExample = () => {
  const handleResultSelect = (result, route) => {
    console.log('Selected result:', result);
    console.log('Navigate to:', route);
    // Custom navigation logic here
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>Basic Global Search Bar</h3>
      <GlobalSearchBar 
        placeholder="Search employees, departments, projects..."
        onResultSelect={handleResultSelect}
        maxDisplayResults={6}
      />
    </div>
  );
};

/**
 * Example 2: Global Search Modal
 * Full-screen search experience with advanced features
 */
export const SearchModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleResultSelect = (result, route) => {
    console.log('Modal result selected:', result);
    // Handle navigation
    setIsModalOpen(false);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h3>Global Search Modal</h3>
      <button 
        onClick={() => setIsModalOpen(true)}
        style={{
          padding: '12px 24px',
          background: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer'
        }}
      >
        Open Search Modal (⌘K)
      </button>

      <GlobalSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onResultSelect={handleResultSelect}
        maxResults={30}
      />
    </div>
  );
};

/**
 * Example 3: Custom Search Component using useGlobalSearch hook
 */
export const CustomSearchExample = () => {
  const {
    searchTerm,
    search,
    clearSearch,
    results,
    hasResults,
    isLoading,
    searchHistory,
    resultsByEntity,
    activeEntities
  } = useGlobalSearch({
    minSearchLength: 2,
    maxResults: 20,
    debounceMs: 300,
    enabledEntities: ['countries', 'employees', 'departments']
  });

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h3>Custom Search Implementation</h3>
      
      {/* Custom Search Input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => search(e.target.value)}
          placeholder="Custom search implementation..."
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #e2e8f0',
            borderRadius: '8px',
            fontSize: '16px'
          }}
        />
        {searchTerm && (
          <button 
            onClick={clearSearch}
            style={{ marginLeft: '10px', padding: '8px 16px' }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Loading State */}
      {isLoading && <div>Searching...</div>}

      {/* Search Results */}
      {hasResults && (
        <div>
          <h4>Results ({results.length})</h4>
          {Object.entries(resultsByEntity).map(([entityType, entityResults]) => {
            const config = activeEntities[entityType];
            if (!config || entityResults.length === 0) return null;

            return (
              <div key={entityType} style={{ marginBottom: '20px' }}>
                <h5>
                  {config.icon} {config.name} ({entityResults.length})
                </h5>
                <div style={{ display: 'grid', gap: '8px' }}>
                  {entityResults.slice(0, 5).map((result) => (
                    <div
                      key={`${result._entityType}-${result.id}`}
                      style={{
                        padding: '12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                      onClick={() => console.log('Navigate to:', result)}
                    >
                      <div style={{ fontWeight: '500' }}>
                        {result._displayText}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>
                        {config.name} • ID: {result.id}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Search History */}
      {searchHistory.length > 0 && !searchTerm && (
        <div>
          <h4>Recent Searches</h4>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {searchHistory.slice(0, 5).map((item) => (
              <button
                key={item.id}
                onClick={() => search(item.term)}
                style={{
                  padding: '6px 12px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {item.term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Example 4: Simple Global Search Hook
 */
export const SimpleSearchExample = () => {
  const {
    search,
    searchTerm,
    results,
    hasResults,
    isLoading,
    clearSearch
  } = useSimpleGlobalSearch({
    maxResults: 10,
    enabledEntities: ['countries', 'employees']
  });

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>Simple Global Search</h3>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => search(e.target.value)}
        placeholder="Simple search..."
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />

      {isLoading && <div>Loading...</div>}
      
      {hasResults && (
        <div>
          <h4>Results</h4>
          {results.map((result) => (
            <div
              key={`${result._entityType}-${result.id}`}
              style={{
                padding: '8px',
                border: '1px solid #eee',
                marginBottom: '4px',
                borderRadius: '4px'
              }}
            >
              {result._entityConfig.icon} {result._displayText}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Example 5: Entity-Specific Search
 */
export const EntitySearchExample = () => {
  const {
    search,
    searchTerm,
    results,
    hasResults,
    isLoading
  } = useEntitySearch('countries', {
    maxResults: 15,
    debounceMs: 200
  });

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
      <h3>Countries-Only Search</h3>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => search(e.target.value)}
        placeholder="Search countries only..."
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '16px',
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}
      />

      {isLoading && <div>Searching countries...</div>}
      
      {hasResults && (
        <div>
          <h4>Countries ({results.length})</h4>
          {results.map((country) => (
            <div
              key={country.id}
              style={{
                padding: '12px',
                border: '1px solid #eee',
                marginBottom: '8px',
                borderRadius: '4px',
                display: 'flex',
                justifyContent: 'space-between'
              }}
            >
              <span>🌍 {country.nameEn}</span>
              <span style={{ color: '#666', fontSize: '12px' }}>
                {country.alpha2Code} • +{country.phoneCode}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Example 6: Header Integration
 */
export const HeaderIntegrationExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 24px',
      background: '#f8fafc',
      borderBottom: '1px solid #e2e8f0'
    }}>
      {/* Logo */}
      <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
        HR Management
      </div>

      {/* Search Bar */}
      <div style={{ flex: 1, maxWidth: '400px', margin: '0 24px' }}>
        <GlobalSearchBar 
          placeholder="Search..."
          showShortcut={true}
          maxDisplayResults={5}
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{
            padding: '8px 16px',
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Advanced Search
        </button>
        
        <GlobalSearchModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </header>
  );
};

/**
 * Example 7: Search with Custom Configuration
 */
export const CustomConfigExample = () => {
  const customConfig = {
    minSearchLength: 1,
    maxResults: 100,
    debounceMs: 150,
    enabledEntities: ['employees', 'projects'],
    searchMode: 'all',
    enableHistory: true,
    maxHistoryItems: 15
  };

  const {
    search,
    searchTerm,
    results,
    hasResults,
    isLoading,
    searchHistory,
    clearHistory
  } = useGlobalSearch(customConfig);

  return (
    <div style={{ padding: '20px' }}>
      <h3>Custom Configuration Search</h3>
      <p>Min length: 1, Max results: 100, Debounce: 150ms</p>
      
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => search(e.target.value)}
        placeholder="Start typing (min 1 character)..."
        style={{
          width: '100%',
          padding: '12px',
          marginBottom: '16px',
          border: '2px solid #e2e8f0',
          borderRadius: '8px'
        }}
      />

      {isLoading && <div>Loading...</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px', gap: '20px' }}>
        {/* Results */}
        <div>
          {hasResults && (
            <>
              <h4>Results ({results.length})</h4>
              {results.slice(0, 10).map((result) => (
                <div
                  key={`${result._entityType}-${result.id}`}
                  style={{
                    padding: '10px',
                    border: '1px solid #eee',
                    marginBottom: '4px',
                    borderRadius: '4px'
                  }}
                >
                  {result._entityConfig.icon} {result._displayText}
                </div>
              ))}
            </>
          )}
        </div>

        {/* History */}
        <div>
          {searchHistory.length > 0 && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>History</h4>
                <button 
                  onClick={clearHistory}
                  style={{ fontSize: '12px', padding: '4px 8px' }}
                >
                  Clear
                </button>
              </div>
              {searchHistory.slice(0, 8).map((item) => (
                <div
                  key={item.id}
                  onClick={() => search(item.term)}
                  style={{
                    padding: '6px',
                    background: '#f9f9f9',
                    marginBottom: '2px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  {item.term}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Main demo component that shows all examples
export const GlobalSearchDemo = () => {
  const [activeExample, setActiveExample] = useState('basic');

  const examples = {
    basic: { component: BasicSearchExample, title: 'Basic Search Bar' },
    modal: { component: SearchModalExample, title: 'Search Modal' },
    custom: { component: CustomSearchExample, title: 'Custom Implementation' },
    simple: { component: SimpleSearchExample, title: 'Simple Hook' },
    entity: { component: EntitySearchExample, title: 'Entity-Specific Search' },
    header: { component: HeaderIntegrationExample, title: 'Header Integration' },
    config: { component: CustomConfigExample, title: 'Custom Configuration' }
  };

  const ActiveComponent = examples[activeExample].component;

  return (
    <div style={{ padding: '20px' }}>
      <h1>Global Search Examples</h1>
      
      {/* Example Selector */}
      <div style={{ marginBottom: '30px' }}>
        <h3>Choose an example:</h3>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {Object.entries(examples).map(([key, { title }]) => (
            <button
              key={key}
              onClick={() => setActiveExample(key)}
              style={{
                padding: '8px 16px',
                background: activeExample === key ? '#3b82f6' : '#f1f5f9',
                color: activeExample === key ? 'white' : '#64748b',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {title}
            </button>
          ))}
        </div>
      </div>

      {/* Active Example */}
      <div style={{
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        padding: '20px',
        background: 'white'
      }}>
        <ActiveComponent />
      </div>
    </div>
  );
};

export default GlobalSearchDemo;