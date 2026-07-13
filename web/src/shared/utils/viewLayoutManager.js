/**
 * View Layout Manager - Utility functions for managing view layouts across the application
 */

// Default view layout configurations
export const VIEW_LAYOUT_CONFIGS = {
  // Standard configuration for most pages
  standard: {
    defaultLayout: "grid",
    validLayouts: ["grid", "list", "smallList"],
    autoSaveDelay: 300,
  },
  
  // Mobile-first configuration
  mobile: {
    defaultLayout: "smallList",
    validLayouts: ["smallList", "list", "grid"],
    autoSaveDelay: 500,
  },
  
  // Desktop-optimized configuration
  desktop: {
    defaultLayout: "grid",
    validLayouts: ["grid", "list"],
    autoSaveDelay: 200,
  },
  
  // Minimal configuration for simple lists
  minimal: {
    defaultLayout: "list",
    validLayouts: ["list", "smallList"],
    autoSaveDelay: 100,
  },
};

// Storage key generators
export const generateStorageKey = (module, page, userId = null) => {
  const base = `view-layout-${module}-${page}`;
  return userId ? `${base}-${userId}` : base;
};

// Responsive layout helpers
export const getResponsiveLayout = (breakpoints) => {
  const { isSm, isMd, isLg } = breakpoints;
  
  if (isSm) return "smallList";
  if (isMd) return "list";
  if (isLg) return "grid";
  return "grid"; // Default for xl and up
};

// Layout validation
export const isValidLayout = (layout, validLayouts = ["grid", "list", "smallList"]) => {
  return validLayouts.includes(layout);
};

// Bulk operations for managing multiple view layouts
export class ViewLayoutManager {
  constructor(prefix = "app") {
    this.prefix = prefix;
  }

  // Get all saved view layouts for the current user/session
  getAllSavedLayouts() {
    const layouts = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}-view-layout-`)) {
          const value = localStorage.getItem(key);
          if (value) {
            layouts[key] = value;
          }
        }
      }
    } catch (error) {
      console.error("Error reading view layouts from localStorage:", error);
    }
    
    return layouts;
  }

  // Clear all saved view layouts
  clearAllLayouts() {
    try {
      const keysToRemove = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}-view-layout-`)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      console.log(`Cleared ${keysToRemove.length} view layout preferences`);
      return keysToRemove.length;
    } catch (error) {
      console.error("Error clearing view layouts from localStorage:", error);
      return 0;
    }
  }

  // Export view layout preferences
  exportPreferences() {
    const layouts = this.getAllSavedLayouts();
    const exportData = {
      timestamp: new Date().toISOString(),
      prefix: this.prefix,
      layouts,
    };
    
    return JSON.stringify(exportData, null, 2);
  }

  // Import view layout preferences
  importPreferences(jsonData) {
    try {
      const data = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      
      if (!data.layouts || typeof data.layouts !== "object") {
        throw new Error("Invalid import data format");
      }
      
      let importedCount = 0;
      
      Object.entries(data.layouts).forEach(([key, value]) => {
        if (key.startsWith(`${this.prefix}-view-layout-`) && typeof value === "string") {
          localStorage.setItem(key, value);
          importedCount++;
        }
      });
      
      console.log(`Imported ${importedCount} view layout preferences`);
      return importedCount;
    } catch (error) {
      console.error("Error importing view layout preferences:", error);
      return 0;
    }
  }

  // Get statistics about saved layouts
  getStatistics() {
    const layouts = this.getAllSavedLayouts();
    const stats = {
      total: Object.keys(layouts).length,
      byLayout: {},
      pages: new Set(),
    };
    
    Object.entries(layouts).forEach(([key, layout]) => {
      // Count by layout type
      stats.byLayout[layout] = (stats.byLayout[layout] || 0) + 1;
      
      // Extract page name from key
      const pageName = key.replace(`${this.prefix}-view-layout-`, "").split("-")[0];
      stats.pages.add(pageName);
    });
    
    stats.pages = Array.from(stats.pages);
    
    return stats;
  }
}

// Default instance
export const defaultViewLayoutManager = new ViewLayoutManager("hr-system");

// Utility functions for common operations
export const viewLayoutUtils = {
  // Generate a storage key for a specific page
  getStorageKey: (pageName, userId = null) => 
    generateStorageKey("hr-system", pageName, userId),
  
  // Get responsive default layout
  getResponsiveDefault: (breakpoints) => getResponsiveLayout(breakpoints),
  
  // Validate layout
  validate: (layout, validLayouts) => isValidLayout(layout, validLayouts),
  
  // Get layout configuration
  getConfig: (configName = "standard") => VIEW_LAYOUT_CONFIGS[configName] || VIEW_LAYOUT_CONFIGS.standard,
  
  // Create responsive layout function
  createResponsiveLayoutFn: (breakpoints) => () => getResponsiveLayout(breakpoints),
};