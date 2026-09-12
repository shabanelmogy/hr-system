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
export const generateStorageKey = (module: string, page: string, userId: string | number | null = null) => {
  const base = `view-layout-${module}-${page}`;
  return userId ? `${base}-${userId}` : base;
};

// Responsive layout helpers
export type ViewBreakpoints = { isSm?: boolean; isMd?: boolean; isLg?: boolean };
export const getResponsiveLayout = (breakpoints: ViewBreakpoints) => {
  const { isSm, isMd, isLg } = breakpoints;
  
  if (isSm) return "smallList";
  if (isMd) return "list";
  if (isLg) return "grid";
  return "grid"; // Default for xl and up
};

// Layout validation
export const isValidLayout = (layout: string, validLayouts: string[] = ["grid", "list", "smallList"]) => {
  return validLayouts.includes(layout);
};

// Bulk operations for managing multiple view layouts
export class ViewLayoutManager {
  prefix: string;
  constructor(prefix: string = "app") {
    this.prefix = prefix;
  }

  // Get all saved view layouts for the current user/session
  getAllSavedLayouts() {
    const layouts: Record<string, string> = {};

    if (typeof window === "undefined") {
      return layouts;
    }
    
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
  importPreferences(jsonData: unknown) {
    try {
      const data: unknown = typeof jsonData === "string" ? JSON.parse(jsonData) : jsonData;
      if (typeof data !== "object" || data === null || !("layouts" in data)) {
        throw new Error("Invalid import data format");
      }
      const layouts = data.layouts;

      if (!layouts || typeof layouts !== "object") {
        throw new Error("Invalid import data format");
      }
      
      let importedCount = 0;
      
      Object.entries(layouts).forEach(([key, value]) => {
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
    const stats: { total: number; byLayout: Record<string, number>; pages: string[] } = {
      total: Object.keys(layouts).length,
      byLayout: {},
      pages: [],
    };
    
    Object.entries(layouts).forEach(([key, layout]) => {
      // Count by layout type
      stats.byLayout[layout] = (stats.byLayout[layout] || 0) + 1;
      
      // Extract page name from key
      const pageName = key.replace(`${this.prefix}-view-layout-`, "").split("-")[0];
      if (!stats.pages.includes(pageName)) stats.pages.push(pageName);
    });
    
    return stats;
  }
}

// Default instance
export const defaultViewLayoutManager = new ViewLayoutManager("erp-system");

// Utility functions for common operations
export const viewLayoutUtils = {
  // Generate a storage key for a specific page
  getStorageKey: (pageName: string, userId: string | number | null = null) =>
    generateStorageKey("erp-system", pageName, userId),
  
  // Get responsive default layout
  getResponsiveDefault: (breakpoints: ViewBreakpoints) => getResponsiveLayout(breakpoints),
  
  // Validate layout
  validate: (layout: string, validLayouts?: string[]) => isValidLayout(layout, validLayouts),
  
  // Get layout configuration
  getConfig: (configName: keyof typeof VIEW_LAYOUT_CONFIGS = "standard") => VIEW_LAYOUT_CONFIGS[configName] || VIEW_LAYOUT_CONFIGS.standard,
  
  // Create responsive layout function
  createResponsiveLayoutFn: (breakpoints: ViewBreakpoints) => () => getResponsiveLayout(breakpoints),
};
