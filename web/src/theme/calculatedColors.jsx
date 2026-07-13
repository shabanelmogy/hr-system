import { alpha } from "@mui/material/styles";

export const calculateBackgroundColor = (isSelected, index, theme) => {
  if (isSelected) {
    return theme.palette.mode === "dark"
      ? alpha(theme.palette.primary.main, 0.7)
      : theme.palette.primary.light;
  }

  return index % 2 === 0 ? "background.paper" : "background.default";
};

export const calculateTextColor = (isSelected, theme) => {
  return isSelected ? theme.palette.primary.contrastText : "text.primary";
};
