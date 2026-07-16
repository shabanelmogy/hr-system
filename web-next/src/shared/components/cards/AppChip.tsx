import React from "react";
import Chip, { ChipProps } from "@mui/material/Chip";
import { alpha, useTheme } from "@mui/material/styles";

const paletteKeys = ["primary", "secondary", "success", "info", "warning", "error"] as const;
export type ColorKey = typeof paletteKeys[number];

export interface AppChipProps extends Omit<ChipProps, "color" | "variant"> {
  label: React.ReactNode;
  colorKey?: ColorKey; // theme palette key used for soft/outlined styles
  variant?: "soft" | "outlined" | "filled"; // default 'soft'
  monospace?: boolean;
  bold?: boolean;
  hoverScale?: boolean;
}

export const AppChip: React.FC<AppChipProps> = ({
  label,
  colorKey = "primary",
  variant = "soft",
  monospace = false,
  bold = false,
  hoverScale = true,
  sx,
  ...rest
}) => {
  const theme = useTheme();
  const colorMain = theme.palette[colorKey].main;

  const baseSx = (() => {
    switch (variant) {
      case "filled":
        return {
          bgcolor: colorMain,
          color: theme.palette.getContrastText(colorMain),
          "&:hover": {
            bgcolor: theme.palette[colorKey].dark,
          },
        } as const;
      case "outlined":
        return {
          color: colorMain,
          borderColor: alpha(colorMain, 0.35),
          bgcolor: "transparent",
          "&:hover": {
            bgcolor: alpha(colorMain, 0.06),
          },
        } as const;
      case "soft":
      default:
        return {
          color: colorMain,
          bgcolor: alpha(colorMain, 0.1),
          borderColor: alpha(colorMain, 0.3),
          "&:hover": {
            bgcolor: alpha(colorMain, 0.2),
          },
        } as const;
    }
  })();

  const fontSx = {
    fontFamily: monospace ? "monospace" : undefined,
    fontWeight: bold ? "bold" : undefined,
  } as const;

  const interactiveSx = hoverScale
    ? {
        transition: "transform 0.15s ease",
        "&:hover": { transform: "scale(1.05)" },
      }
    : undefined;

  return (
    <Chip
      size="small"
      variant={variant === "filled" ? "filled" : variant === "outlined" ? "outlined" : "outlined"}
      sx={{
        ...baseSx,
        ...fontSx,
        ...interactiveSx,
        ...sx,
      }}
      label={label}
      {...rest}
    />
  );
};

export default AppChip;
