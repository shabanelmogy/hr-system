import Box from "@mui/material/Box";
import type { ReactNode } from "react";

export default function ColoredIcon({
  children,
  color,
}: {
  children: ReactNode;
  color: string;
}) {
  return (
    <Box
      component="span"
      sx={{
        color,
        display: "inline-flex",
        filter: `drop-shadow(0 1px 2px ${color}66)`,
        transition: "transform 0.2s ease, filter 0.2s ease",
        "& svg": { color: "inherit" },
        "&:hover": {
          transform: "scale(1.1)",
          filter: `drop-shadow(0 2px 3px ${color}88)`,
        },
      }}
    >
      {children}
    </Box>
  );
}
