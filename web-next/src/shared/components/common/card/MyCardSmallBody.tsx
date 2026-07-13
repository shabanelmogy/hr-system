/* eslint-disable react/prop-types */
import { Box, useTheme } from "@mui/material";

export default function MyCardSmallBody({ isHighlighted, children }) {
  const theme = useTheme();
  return (
    <Box
      sx={{
        p: 2,
        flexGrow: 1,
        bgcolor: isHighlighted
          ? theme.palette.mode === "dark"
            ? "primary.dark"
            : "primary.light"
          : "inherit",
        opacity: isHighlighted
          ? theme.palette.mode === "dark"
            ? 0.9
            : 0.2
          : 1,
      }}
    >
      {children}
    </Box>
  );
}
