import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { resolveModuleAccent, type ModuleAccent } from "./moduleAccents";

export default function ColoredIcon({
  children,
  color,
}: {
  children: ReactNode;
  /** A module accent key (preferred) or any CSS color. */
  color: ModuleAccent | string;
}) {
  const theme = useTheme();
  const resolved = resolveModuleAccent(color, theme.palette.mode) ?? color;

  return (
    <Box
      component="span"
      sx={{
        color: resolved,
        display: "inline-flex",
        filter: `drop-shadow(0 1px 2px ${resolved}66)`,
        transition: "transform 0.2s ease, filter 0.2s ease",
        "& svg": { color: "inherit" },
        "&:hover": {
          transform: "scale(1.1)",
          filter: `drop-shadow(0 2px 3px ${resolved}88)`,
        },
      }}
    >
      {children}
    </Box>
  );
}
