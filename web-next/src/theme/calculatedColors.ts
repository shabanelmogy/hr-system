import { alpha, Theme } from "@mui/material/styles";

export const calculateBackgroundColor = (
  isSelected: boolean,
  index: number,
  theme: Theme
): string => {
  if (isSelected) {
    return theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.7)
      : theme.palette.primary.light;
  }

  return index % 2 === 0 ? "background.paper" : "background.default";
};

export const calculateTextColor = (isSelected: boolean, theme: Theme): string => {
  return isSelected ? theme.palette.primary.contrastText : "text.primary";
};
