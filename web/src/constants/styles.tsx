/* eslint-disable react/prop-types */
import { SvgIcon } from "@mui/material";

/**
 * Enhanced color palettes with modern and harmonious combinations
 */
export const colorThemes = {
  // Purple theme (primary)
  purple: {
    primary: "#7C3AED", // Vivid purple
    primaryLight: "#F5F3FF", // Soft purple background
    primaryDark: "#6D28D9", // Deep purple for gradients
    completed: "#10B981", // Emerald green
    completedLight: "#ECFDF5", // Soft mint background
    inactive: "#F9FAFB", // Very light gray with hint of purple
    inactiveIcon: "#A5A6B9",
    iconActive: "#94A3B8",
    iconCompleted: "#94A3B8", // Soft purple-gray for inactive
    connector: "#E9E9FF", // Light purple for connectors
    text: "#1F2937", // Dark text for readability
    textSecondary: "#4B5563",
    white: "#F9FAFB", // Medium gray with hint of purple
  },

  // Purple dark theme
  purpleDark: {
    primary: "#A78BFA", // Bright lavender
    primaryLight: "#2D1B69", // Deep purple background
    primaryDark: "#8B5CF6", // Vibrant purple for gradients
    completed: "#34D399", // Bright emerald
    completedLight: "#064E3B", // Deep green background
    inactive: "#1F1646", // Dark purple background
    inactiveIcon: "#6B7280",
    iconActive: "#94A3B8",
    iconCompleted: "#94A3B8", // Medium gray for inactive
    connector: "#312E81", // Deep indigo for connectors
    text: "#F9FAFB", // Nearly white for text
    textSecondary: "#D1D5DB", // Light gray for secondary text
  },

  // Teal theme (alternate)
  teal: {
    primary: "#0D9488", // Rich teal
    primaryLight: "#F0FDFA", // Soft teal background
    primaryDark: "#0F766E", // Deep teal for gradients
    completed: "#2563EB", // Royal blue
    completedLight: "#EFF6FF", // Soft blue background
    inactive: "#F8FAFC", // Very light slate
    inactiveIcon: "#94A3B8",
    iconActive: "#94A3B8",
    iconCompleted: "#94A3B8", // Soft slate-gray
    connector: "#E0F2F1", // Very light teal for connectors
    text: "#1E293B", // Deep slate
    textSecondary: "#475569", // Medium slate
  },

  // Teal dark theme
  tealDark: {
    primary: "#2DD4BF", // Bright teal
    primaryLight: "#134E4A", // Deep teal background
    primaryDark: "#0F766E", // Deep teal for gradients
    completed: "#60A5FA", // Bright blue
    completedLight: "#1E3A8A", // Deep blue background
    inactive: "#0F172A", // Very dark slate
    inactiveIcon: "#64748B",
    iconActive: "#94A3B8",
    iconCompleted: "#94A3B8",
    connector: "#1E293B", // Deep slate for connectors
    text: "#F8FAFC", // Nearly white
    textSecondary: "#E2E8F0", // Very light slate
  },
};

export const gradientButtonStyle = {
  color: "#fff",
  background: "linear-gradient(45deg, #2575fc, #6a11cb)",
  "&:hover": {
    background: "linear-gradient(45deg, #1e5ed6, #5a0cb0)",
  },
};

/**
 * Custom gradient background for form header
 */
export const headerStyles = {
  gradientBg: {
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: `linear-gradient(135deg,
        rgba(37, 117, 252, 0.9),
        rgba(106, 17, 203, 0.85))`,
      zIndex: 1,
    },
    "&::after": {
      content: '""',
      position: "absolute",
      top: "-50%",
      right: "-50%",
      width: "200%",
      height: "200%",
      background:
        "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 50%)",
      transform: "rotate(-45deg)",
      zIndex: 2,
    },
  },

  // Custom gradient backgrounds for different themes
  purpleGradient: {
    "&::before": {
      background: `linear-gradient(135deg,
        rgba(124, 58, 237, 0.95),
        rgba(109, 40, 217, 0.85))`,
    },
  },

  tealGradient: {
    "&::before": {
      background: `linear-gradient(135deg,
        rgba(13, 148, 136, 0.95),
        rgba(15, 118, 110, 0.85))`,
    },
  },
};

export const ColoredIcon = ({ children, color, secondaryColor = null }: { children: any; color: string; secondaryColor?: string | null }) => {
  return (
    <SvgIcon
      sx={{
        color,
        "& .secondary": { color: secondaryColor || color },
        filter: `drop-shadow(0px 1px 2px ${color}66)`,
        transition: "all 0.2s ease",
        "&:hover": {
          transform: "scale(1.1)",
          filter: `drop-shadow(0px 2px 3px ${color}88)`,
        },
      }}
    >
      {children}
    </SvgIcon>
  );
};
