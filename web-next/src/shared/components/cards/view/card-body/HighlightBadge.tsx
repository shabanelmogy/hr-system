import React from "react";
import { Chip, useTheme } from "@mui/material";

// HighlightBadge: animated left badge with label (e.g., New, Edited)
export const HighlightBadge: React.FC<{ label: string }> = ({ label }) => {
  const theme = useTheme();
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        bgcolor: theme.palette.error.main,
        color: "white",
        fontWeight: "bold",
        fontSize: "0.65rem",
        animation: "bounce 1s ease-in-out infinite",
        "@keyframes bounce": {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-4px)" },
          "60%": { transform: "translateY(-2px)" },
        },
      }}
    />
  );
};
