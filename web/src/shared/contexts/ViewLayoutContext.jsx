import React, { createContext, useContext, useCallback, useEffect, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { defaultViewLayoutManager, viewLayoutUtils } from "../utils/viewLayoutManager";

// Create the context
const ViewLayoutContext = createContext(null);

// Custom hook to use the view layout context
export const useViewLayoutContext = () => {
  const context = useContext(ViewLayoutContext);
  if (!context) {
    throw new Error("useViewLayoutContext must be used within a ViewLayoutProvider");
  }
  return context;
};

// Provider component
export const ViewLayoutProvider = ({ children }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const isLg = useMediaQuery(theme.breakpoints.down("lg"));

  // Global view layout preferences
  const [globalPreferences, setGlobalPreferences] = useState({
    autoSave: true,
    autoSaveDelay: 300,
    useResponsiveDefaults: true,
    debugMode: import.meta.env.DEV,
  });

  // Statistics about saved layouts
  const [layoutStats, setLayoutStats] = useState(null);

  // Update statistics
  const updateStats = useCallback(() => {
    const stats = defaultViewLayoutManager.getStatistics();
    setLayoutStats(stats);
  }, []);

  // Initialize statistics on mount
  useEffect(() => {
    updateStats();
  }, [updateStats]);

  // Get responsive breakpoints
  const getBreakpoints = useCallback(() => ({
    isSm,
    isMd,
    isLg,
    isXl: !isLg,
  }), [isSm, isMd, isLg]);

  // Get responsive default layout
  const getResponsiveDefault = useCallback(() => {
    if (!globalPreferences.useResponsiveDefaults) return "grid";
    return viewLayoutUtils.getResponsiveDefault(getBreakpoints());
  }, [globalPreferences.useResponsiveDefaults, getBreakpoints]);

  // Create a view layout hook with global settings
  const createViewLayoutHook = useCallback((storageKey, options = {}) => {
    const mergedOptions = {
      autoSaveDelay: globalPreferences.autoSaveDelay,
      getResponsiveDefault: globalPreferences.useResponsiveDefaults ? getResponsiveDefault : null,
      debug: globalPreferences.debugMode,
      onLayoutChange: (newLayout, oldLayout) => {
        // Update statistics when layout changes
        updateStats();
        
        // Call custom callback if provided
        if (options.onLayoutChange) {
          options.onLayoutChange(newLayout, oldLayout);
        }
      },
      ...options,
    };

    return {
      storageKey,
      options: mergedOptions,
    };
  }, [globalPreferences, getResponsiveDefault, updateStats]);

  // Global operations
  const globalOperations = {
    // Clear all saved layouts
    clearAllLayouts: useCallback(() => {
      const count = defaultViewLayoutManager.clearAllLayouts();
      updateStats();
      return count;
    }, [updateStats]),

    // Export all preferences
    exportPreferences: useCallback(() => {
      return defaultViewLayoutManager.exportPreferences();
    }, []),

    // Import preferences
    importPreferences: useCallback((jsonData) => {
      const count = defaultViewLayoutManager.importPreferences(jsonData);
      updateStats();
      return count;
    }, [updateStats]),

    // Get all saved layouts
    getAllLayouts: useCallback(() => {
      return defaultViewLayoutManager.getAllSavedLayouts();
    }, []),

    // Update global preferences
    updatePreferences: useCallback((newPreferences) => {
      setGlobalPreferences(prev => ({ ...prev, ...newPreferences }));
    }, []),
  };

  // Context value
  const contextValue = {
    // Global state
    globalPreferences,
    layoutStats,
    breakpoints: getBreakpoints(),
    
    // Utilities
    getResponsiveDefault,
    createViewLayoutHook,
    
    // Global operations
    ...globalOperations,
    
    // Utility functions
    utils: viewLayoutUtils,
    manager: defaultViewLayoutManager,
  };

  return (
    <ViewLayoutContext.Provider value={contextValue}>
      {children}
    </ViewLayoutContext.Provider>
  );
};

// HOC for components that need view layout context
export const withViewLayout = (Component) => {
  return function ViewLayoutWrappedComponent(props) {
    return (
      <ViewLayoutProvider>
        <Component {...props} />
      </ViewLayoutProvider>
    );
  };
};