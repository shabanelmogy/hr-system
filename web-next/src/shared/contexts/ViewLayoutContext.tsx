import React, { createContext, useContext, useCallback, useState } from "react";
import { useMediaQuery, useTheme } from "@mui/material";
import { defaultViewLayoutManager, viewLayoutUtils } from "../utils/viewLayoutManager";

type GlobalPreferences = {
  autoSave: boolean;
  autoSaveDelay: number;
  useResponsiveDefaults: boolean;
  debugMode: boolean;
};
type LayoutHookOptions = {
  autoSaveDelay?: number;
  getResponsiveDefault?: (() => string) | null;
  onLayoutChange?: (newLayout: string, oldLayout: string) => void;
  debug?: boolean;
};
type ViewLayoutContextValue = {
  globalPreferences: GlobalPreferences;
  layoutStats: ReturnType<typeof defaultViewLayoutManager.getStatistics> | null;
  breakpoints: { isSm: boolean; isMd: boolean; isLg: boolean; isXl: boolean };
  getResponsiveDefault: () => string;
  createViewLayoutHook: (storageKey: string, options?: LayoutHookOptions) => { storageKey: string; options: LayoutHookOptions };
  clearAllLayouts: () => number;
  exportPreferences: () => string;
  importPreferences: (jsonData: unknown) => number;
  getAllLayouts: () => Record<string, string>;
  updatePreferences: (newPreferences: Partial<GlobalPreferences>) => void;
  utils: typeof viewLayoutUtils;
  manager: typeof defaultViewLayoutManager;
};

// Create the context
const ViewLayoutContext = createContext<ViewLayoutContextValue | null>(null);

// Custom hook to use the view layout context
export const useViewLayoutContext = () => {
  const context = useContext(ViewLayoutContext);
  if (!context) {
    throw new Error("useViewLayoutContext must be used within a ViewLayoutProvider");
  }
  return context;
};

// Provider component
export const ViewLayoutProvider = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const isSm = useMediaQuery(theme.breakpoints.down("sm"));
  const isMd = useMediaQuery(theme.breakpoints.down("md"));
  const isLg = useMediaQuery(theme.breakpoints.down("lg"));

  // Global view layout preferences
  const [globalPreferences, setGlobalPreferences] = useState({
    autoSave: true,
    autoSaveDelay: 300,
    useResponsiveDefaults: true,
    debugMode: process.env.NODE_ENV !== "production",
  });

  // Statistics about saved layouts
  const [layoutStats, setLayoutStats] = useState(() => defaultViewLayoutManager.getStatistics());

  // Update statistics
  const updateStats = useCallback(() => {
    const stats = defaultViewLayoutManager.getStatistics();
    setLayoutStats(stats);
  }, []);

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
  const createViewLayoutHook = useCallback((storageKey: string, options: LayoutHookOptions = {}) => {
    const mergedOptions = {
      autoSaveDelay: globalPreferences.autoSaveDelay,
      getResponsiveDefault: globalPreferences.useResponsiveDefaults ? getResponsiveDefault : null,
      debug: globalPreferences.debugMode,
      onLayoutChange: (newLayout: string, oldLayout: string) => {
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
    importPreferences: useCallback((jsonData: unknown) => {
      const count = defaultViewLayoutManager.importPreferences(jsonData);
      updateStats();
      return count;
    }, [updateStats]),

    // Get all saved layouts
    getAllLayouts: useCallback(() => {
      return defaultViewLayoutManager.getAllSavedLayouts();
    }, []),

    // Update global preferences
    updatePreferences: useCallback((newPreferences: Partial<GlobalPreferences>) => {
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
