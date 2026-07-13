/**
 * Color system parameters module
 *
 * This module provides a function to create a complete color system
 * while only requiring three parameters to be passed:
 * - isDarkMode: boolean to toggle between dark and light themes
 * - theme: the UI framework theme object (e.g., MUI theme)
 * - alpha: a function to manipulate color opacity
 */

interface ColorSystemParams {
  isDarkMode: boolean;
  theme?: any;
  alpha?: (color: string, opacity: number) => string;
}

// Creates a complete color system based on given parameters
export const createColorSystem = ({
  isDarkMode,
  theme,
  alpha,
}: ColorSystemParams) => {
  // If no alpha function is provided, use a default implementation
  const applyAlpha =
    alpha ||
    ((color, opacity) => {
      if (color.startsWith("#")) {
        const r = parseInt(color.slice(1, 3), 16);
        const g = parseInt(color.slice(3, 5), 16);
        const b = parseInt(color.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      }
      return color;
    });

  // Core brand colors
  const primary = {
    main: "#4f46e5", // Indigo
    light: "#818cf8",
    dark: "#4338ca",
    contrastText: "#ffffff",
  };

  const secondary = {
    main: "#9333ea", // Purple
    light: "#a855f7",
    dark: "#7e22ce",
    contrastText: "#ffffff",
  };

  // Accent colors
  const accent = {
    success: "#10b981", // Emerald green
    info: "#0ea5e9", // Sky blue
    warning: "#f59e0b", // Amber
    error: "#ef4444", // Red
    successLight: "#d1fae5",
    infoLight: "#e0f7ff",
    warningLight: "#fef3c7",
    errorLight: "#fee2e2",
  };

  // Neutral tones
  const neutral = {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  };

  // Gradients
  const gradients = {
    primary: isDarkMode
      ? `linear-gradient(135deg, ${applyAlpha("#4338ca", 0.95)}, ${applyAlpha(
          "#4f46e5",
          0.9
        )})`
      : `linear-gradient(135deg, #4f46e5, #818cf8)`,
    secondary: isDarkMode
      ? `linear-gradient(135deg, ${applyAlpha("#7e22ce", 0.95)}, ${applyAlpha(
          "#9333ea",
          0.9
        )})`
      : `linear-gradient(135deg, #9333ea, #a855f7)`,
    accent: isDarkMode
      ? `linear-gradient(135deg, ${applyAlpha("#4338ca", 0.95)}, ${applyAlpha(
          "#9333ea",
          0.9
        )})`
      : `linear-gradient(135deg, #4f46e5, #9333ea)`,
    card: isDarkMode
      ? `linear-gradient(135deg, ${applyAlpha("#1f2937", 0.95)}, ${applyAlpha(
          "#111827",
          0.9
        )})`
      : `linear-gradient(135deg, #ffffff, #f9fafb)`,
  };

  // UI component colors using the provided theme
  const components = {
    cardBackground: isDarkMode
      ? applyAlpha(theme?.palette?.background?.paper || "#1f2937", 0.8)
      : "#ffffff",
    bodyBackground: isDarkMode
      ? applyAlpha(theme?.palette?.background?.paper || "#1f2937", 0.5)
      : applyAlpha("#f9fafb", 0.7),
    uploadArea: isDarkMode
      ? applyAlpha(theme?.palette?.background?.paper || "#1f2937", 0.3)
      : applyAlpha("#f3f4f6", 0.8),
    uploadBorder: isDarkMode
      ? applyAlpha(theme?.palette?.grey?.[400] || "#9ca3af", 0.3)
      : "#e5e7eb",
    uploadAreaActive: isDarkMode
      ? applyAlpha("#4f46e5", 0.15)
      : applyAlpha("#4f46e5", 0.1),
    uploadBorderActive: isDarkMode ? "#818cf8" : "#4f46e5",
    inputBorder: isDarkMode
      ? applyAlpha(theme?.palette?.divider || "#374151", 0.2)
      : "#d1d5db",
    inputBorderFocus: isDarkMode ? "#818cf8" : "#4f46e5",
  };

  // Shadows
  const shadows = {
    sm: isDarkMode
      ? `0 2px 4px ${applyAlpha("#000000", 0.1)}`
      : `0 1px 3px ${applyAlpha("#111827", 0.08)}`,
    md: isDarkMode
      ? `0 4px 8px ${applyAlpha("#000000", 0.12)}`
      : `0 4px 6px ${applyAlpha("#111827", 0.1)}`,
    lg: isDarkMode
      ? `0 8px 16px ${applyAlpha("#000000", 0.15)}`
      : `0 10px 15px ${applyAlpha("#111827", 0.07)}`,
    xl: isDarkMode
      ? `0 16px 24px ${applyAlpha("#000000", 0.15)}, 0 6px 12px ${applyAlpha(
          "#000000",
          0.1
        )}`
      : `0 20px 25px ${applyAlpha("#111827", 0.07)}, 0 8px 10px ${applyAlpha(
          "#111827",
          0.04
        )}`,
    glow: (color: string) =>
      isDarkMode
        ? `0 0 15px ${applyAlpha(color, 0.6)}`
        : `0 0 12px ${applyAlpha(color, 0.4)}`,
  };

  // Status colors with glow effects
  const status = {
    verified: {
      color: "#10b981",
      glow: isDarkMode
        ? `0 0 10px ${applyAlpha("#10b981", 0.6)}`
        : `0 0 8px ${applyAlpha("#10b981", 0.35)}`,
      pulseFrom: applyAlpha("#10b981", isDarkMode ? 0.4 : 0.2),
      pulseTo: applyAlpha("#10b981", isDarkMode ? 0.7 : 0.4),
    },
    pending: {
      color: "#f59e0b",
      glow: isDarkMode
        ? `0 0 10px ${applyAlpha("#f59e0b", 0.5)}`
        : `0 0 8px ${applyAlpha("#f59e0b", 0.3)}`,
    },
    error: {
      color: "#ef4444",
      glow: isDarkMode
        ? `0 0 10px ${applyAlpha("#ef4444", 0.5)}`
        : `0 0 8px ${applyAlpha("#ef4444", 0.3)}`,
    },
  };

  // Password strength colors
  const passwordStrength = [
    "#ef4444", // Red - weak
    "#f59e0b", // Amber - fair
    "#3b82f6", // Blue - good
    "#10b981", // Green - strong
  ];

  // Return the complete color system
  return {
    primary,
    secondary,
    accent,
    neutral,
    gradients,
    components,
    shadows,
    status,
    passwordStrength,

    alpha: applyAlpha,
  };
};
