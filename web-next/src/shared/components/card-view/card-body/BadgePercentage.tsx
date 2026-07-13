import React from "react";
import { Chip, alpha, useTheme } from "@mui/material";

// BadgePercentage: percentage chip for top-right corner
export const BadgePercentage: React.FC<{
  value: number;
  highlighted?: boolean;
  color?: string; // fallback color if provided
}> = ({ value, highlighted = false, color }) => {
  const theme = useTheme();
  const badgeColor = color || theme.palette.primary.main;
  return (
    <Chip
      label={`${Math.round(value)}%`}
      size="small"
      sx={{
        bgcolor: highlighted ? theme.palette.success.main : badgeColor,
        color: "white",
        fontWeight: "bold",
        fontSize: "0.7rem",
        boxShadow: `0 2px 8px ${alpha(highlighted ? theme.palette.success.main : badgeColor, 0.3)}`,
      }}
    />
  );
};
