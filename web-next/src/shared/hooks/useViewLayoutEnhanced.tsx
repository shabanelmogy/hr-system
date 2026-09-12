import { useCallback, useEffect, useRef, useState } from "react";

type ViewLayoutOptions = {
  autoSaveDelay?: number;
  getResponsiveDefault?: () => string;
  onLayoutChange?: (newLayout: string, previousLayout: string) => void;
  debug?: boolean;
};

/**
 * Enhanced hook for managing view layout state with localStorage persistence
 * Supports additional features like user preferences, responsive defaults, etc.
 */
const useViewLayoutEnhanced = (
  storageKey: string,
  defaultLayout = "grid",
  validLayouts: readonly string[] = ["grid", "list", "smallList"],
  options: ViewLayoutOptions = {}
) => {
  const {
    // Auto-save delay in milliseconds (0 = immediate save)
    autoSaveDelay = 0,
    // Function to determine responsive default layout
    getResponsiveDefault = null,
    // Callback when layout changes
    onLayoutChange = null,
    // Enable debug logging
    debug = false,
  } = options;

  // Initialize from localStorage or default
  const [viewLayout, setViewLayout] = useState<string>(() => {
    try {
      const savedView = localStorage.getItem(storageKey);
      
      if (savedView && validLayouts.includes(savedView)) {
        if (debug) {
          console.log(`[useViewLayoutEnhanced] Loaded saved layout: ${savedView}`);
        }
        return savedView;
      }
      
      // Use responsive default if provided
      const responsiveDefault = getResponsiveDefault?.() || defaultLayout;
      
      if (debug) {
        console.log(`[useViewLayoutEnhanced] Using default layout: ${responsiveDefault}`);
      }
      
      return responsiveDefault;
    } catch (error) {
      console.error("Error accessing localStorage for view layout:", error);
      return defaultLayout;
    }
  });

  const saveTimeoutRef = useRef<number | null>(null);

  // Save to localStorage with optional delay
  const saveToStorage = useCallback((layout: string) => {
    try {
      localStorage.setItem(storageKey, layout);
      if (debug) {
        console.log(`[useViewLayoutEnhanced] Saved layout to localStorage: ${layout}`);
      }
    } catch (error) {
      console.error("Error saving view layout to localStorage:", error);
    }
  }, [storageKey, debug]);

  const scheduleSave = useCallback((layout: string) => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = null;
    }

    if (autoSaveDelay <= 0) {
      saveToStorage(layout);
      return;
    }

    saveTimeoutRef.current = window.setTimeout(() => {
      saveToStorage(layout);
      saveTimeoutRef.current = null;
    }, autoSaveDelay);
  }, [autoSaveDelay, saveToStorage]);

  useEffect(() => () => {
    if (saveTimeoutRef.current !== null) {
      window.clearTimeout(saveTimeoutRef.current);
    }
  }, []);

  // Handle view layout change
  const handleViewLayoutChange = useCallback((_event: unknown, newLayout: string | null) => {
    if (newLayout !== null && validLayouts.includes(newLayout)) {
      setViewLayout(newLayout);
      
      scheduleSave(newLayout);
      
      // Call onChange callback if provided
      if (onLayoutChange) {
        onLayoutChange(newLayout, viewLayout);
      }
      
      if (debug) {
        console.log(`[useViewLayoutEnhanced] Layout changed: ${viewLayout} -> ${newLayout}`);
      }
    }
  }, [debug, onLayoutChange, scheduleSave, validLayouts, viewLayout]);

  // Programmatically set layout (useful for responsive changes)
  const setLayout = useCallback((newLayout: string) => {
    if (validLayouts.includes(newLayout)) {
      handleViewLayoutChange(null, newLayout);
    } else {
      console.warn(`[useViewLayoutEnhanced] Invalid layout: ${newLayout}. Valid layouts: ${validLayouts.join(', ')}`);
    }
  }, [validLayouts, handleViewLayoutChange]);

  // Reset to default layout
  const resetLayout = useCallback(() => {
    const resetTo = getResponsiveDefault?.() || defaultLayout;
    setLayout(resetTo);
  }, [defaultLayout, getResponsiveDefault, setLayout]);

  // Clear saved layout from localStorage
  const clearSavedLayout = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      if (debug) {
        console.log(`[useViewLayoutEnhanced] Cleared saved layout from localStorage`);
      }
    } catch (error) {
      console.error("Error clearing saved layout from localStorage:", error);
    }
  }, [storageKey, debug]);

  // Get layout info
  const layoutInfo = {
    current: viewLayout,
    isDefault: viewLayout === defaultLayout,
    validLayouts,
    storageKey,
  };

  return {
    // Current state
    viewLayout,
    layoutInfo,
    
    // Event handlers
    handleViewLayoutChange,
    
    // Programmatic controls
    setLayout,
    resetLayout,
    clearSavedLayout,
    
    // Utilities
    isValidLayout: (layout: string) => validLayouts.includes(layout),
  };
};

export default useViewLayoutEnhanced;
