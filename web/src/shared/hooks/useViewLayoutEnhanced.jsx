import { useState, useEffect, useCallback } from "react";

/**
 * Enhanced hook for managing view layout state with localStorage persistence
 * Supports additional features like user preferences, responsive defaults, etc.
 */
const useViewLayoutEnhanced = (
  storageKey,
  defaultLayout = "grid",
  validLayouts = ["grid", "list", "smallList"],
  options = {}
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
  const [viewLayout, setViewLayout] = useState(() => {
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

  // Track if we need to save to localStorage
  const [pendingSave, setPendingSave] = useState(null);

  // Save to localStorage with optional delay
  const saveToStorage = useCallback((layout) => {
    try {
      localStorage.setItem(storageKey, layout);
      if (debug) {
        console.log(`[useViewLayoutEnhanced] Saved layout to localStorage: ${layout}`);
      }
    } catch (error) {
      console.error("Error saving view layout to localStorage:", error);
    }
  }, [storageKey, debug]);

  // Handle delayed saving
  useEffect(() => {
    if (pendingSave) {
      if (autoSaveDelay > 0) {
        const timeoutId = setTimeout(() => {
          saveToStorage(pendingSave);
          setPendingSave(null);
        }, autoSaveDelay);

        return () => clearTimeout(timeoutId);
      } else {
        saveToStorage(pendingSave);
        setPendingSave(null);
      }
    }
  }, [pendingSave, autoSaveDelay, saveToStorage]);

  // Handle view layout change
  const handleViewLayoutChange = useCallback((event, newLayout) => {
    if (newLayout !== null && validLayouts.includes(newLayout)) {
      setViewLayout(newLayout);
      
      // Schedule save to localStorage
      setPendingSave(newLayout);
      
      // Call onChange callback if provided
      if (onLayoutChange) {
        onLayoutChange(newLayout, viewLayout);
      }
      
      if (debug) {
        console.log(`[useViewLayoutEnhanced] Layout changed: ${viewLayout} -> ${newLayout}`);
      }
    }
  }, [viewLayout, validLayouts, onLayoutChange, debug]);

  // Programmatically set layout (useful for responsive changes)
  const setLayout = useCallback((newLayout) => {
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
    isValidLayout: (layout) => validLayouts.includes(layout),
  };
};

export default useViewLayoutEnhanced;