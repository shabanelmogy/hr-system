export const getDesignTokens = (mode, direction = "ltr") => ({
  direction, // add the direction property here
  palette: {
    mode,
    ...(mode === "light"
      ? {
          myColor: {
            main: "#DD0F0FFF",
          },
          purple: {
            primary: "#7C3AED", // Vivid purple
            primaryLight: "#F5F3FF", // Soft purple background
            primaryDark: "#6D28D9", // Deep purple for gradients
            completed: "#E0FFF0", // Soft Mint
            completedLight: "#ECFDF5", // Soft mint background
            inactive: "#D4E0FF", // Very light gray with hint of purple
            inactiveIcon: "#A5A6B9",
            iconActive: "#94A3B8",
            iconCompleted: "#e91e63", // Soft purple-gray for inactive
            connector: "#E9E9FF", // Light purple for connectors
            text: "#1F2937", // Dark text for readability
            textSecondary: "#4B5563",
            white: "#F9FAFB", // Medium gray with hint of purple
          },
          success: {
            light: "#7986cb", // Indigo 300
            main: "#3f51b5",
            dark: "#303f9f", // Indigo 700
            contrastText: "#ffffff",
          },
        }
      : {
          myColor: {
            main: "#1D0FDDFF",
          },
          purple: {
            primary: "#A78BFA", // Bright lavender
            primaryLight: "#2D1B69", // Deep purple background
            primaryDark: "#8B5CF6", // Vibrant purple for gradients
            completed: "#E0FFF0", // Bright emerald
            completedLight: "#182A54", // Deep green background
            inactive: "#1D1A3A",
            inactiveIcon: "#6B7280",
            iconActive: "#94A3B8",
            iconCompleted: "#F9FAFB", // Medium gray for inactive
            connector: "#312E81", // Deep indigo for connectors
            text: "#F9FAFB", // Nearly white for text
            textSecondary: "#D1D5DB", // Light gray for secondary text
            white: "#F9FAFB", // Medium gray with hint of purple
          },
          success: {
            light: "#b3e5fc", // Lighter cyan/blue
            main: "#0288d1", // Light Blue 700
            dark: "#01579b", // Light Blue 900
            contrastText: "#212121",
          },
        }),
  },
});
