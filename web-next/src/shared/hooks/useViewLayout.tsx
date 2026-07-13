import { useState } from "react";

const useViewLayout = (
  storageKey: string,
  defaultLayout = "grid",
  validLayouts = ["grid", "list", "smallList"]
): [string, (event: any, newLayout: string | null) => void] => {
  // Initialize from localStorage or default
  const [viewLayout, setViewLayout] = useState(() => {
    if (typeof window === "undefined") {
      return defaultLayout;
    }

    try {
      const savedView = window.localStorage.getItem(storageKey);
      return savedView && validLayouts.includes(savedView)
        ? savedView
        : defaultLayout;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return defaultLayout;
    }
  });

  // Handle view layout change
  const handleViewLayoutChange = (event: any, newLayout: string | null) => {
    if (newLayout !== null) {
      setViewLayout(newLayout);
      // Save the selected view to localStorage
      if (typeof window === "undefined") {
        return;
      }

      try {
        window.localStorage.setItem(storageKey, newLayout);
      } catch (error) {
        console.error("Error saving view layout to localStorage:", error);
      }
    }
  };

  return [viewLayout, handleViewLayoutChange];
};

export default useViewLayout;
