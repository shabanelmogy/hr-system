import Box from "@mui/material/Box";
import { alpha, useTheme } from "@mui/material/styles";
import type { ReactNode } from "react";
import { resolveSequenceAccent, type ModuleAccent } from "./moduleAccents";
import { useNavigationIconSequence } from "./NavigationIconSequence";

export default function ColoredIcon({
  children,
  color,
}: {
  children: ReactNode;
  /** A module accent key (preferred) or any CSS color. */
  color: ModuleAccent | string;
}) {
  const theme = useTheme();
  // Inside a navigation list each entry gets its own color; elsewhere (section headers,
  // launcher) the module's own color is used.
  const sequenceIndex = useNavigationIconSequence();
  const resolved = resolveSequenceAccent(color, sequenceIndex ?? -1, theme) ?? color;

  return (
    <Box
      component="span"
      sx={{
        color: resolved,
        display: "inline-flex",
        filter: `drop-shadow(0 1px 2px ${alpha(resolved, 0.4)})`,
        transition: "transform 0.2s ease, filter 0.2s ease",
        "& svg": { color: "inherit" },
        "&:hover": {
          transform: "scale(1.1)",
          filter: `drop-shadow(0 2px 3px ${alpha(resolved, 0.53)})`,
        },
      }}
    >
      {children}
    </Box>
  );
}
