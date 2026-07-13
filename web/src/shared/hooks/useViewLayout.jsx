import { useState } from "react";

const useViewLayout = (
  storageKey,
  defaultLayout = "grid",
  validLayouts = ["grid", "list", "smallList"]
) => {
  // Initialize from localStorage or default
  const [viewLayout, setViewLayout] = useState(() => {
    try {
      const savedView = localStorage.getItem(storageKey);
      return savedView && validLayouts.includes(savedView)
        ? savedView
        : defaultLayout;
    } catch (error) {
      console.error("Error accessing localStorage:", error);
      return defaultLayout;
    }
  });

  // Handle view layout change
  const handleViewLayoutChange = (event, newLayout) => {
    if (newLayout !== null) {
      setViewLayout(newLayout);
      // Save the selected view to localStorage
      try {
        localStorage.setItem(storageKey, newLayout);
      } catch (error) {
        console.error("Error saving view layout to localStorage:", error);
      }
    }
  };

  return [viewLayout, handleViewLayoutChange];
};

export default useViewLayout;
