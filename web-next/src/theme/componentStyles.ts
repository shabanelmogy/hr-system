import type { Theme } from "@mui/material/styles";

/** Icon badge in the active palette's primary color (was a fixed blue/purple gradient). */
export const gradientIconStyle = (theme: Theme) =>
  ({
    color: theme.palette.primary.contrastText,
    background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
    "&:hover": {
      background: theme.palette.primary.dark,
    },
  }) as const;

export const authHeaderStyles = (theme: Theme) => ({
  gradientBackground: {
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      inset: 0,
      background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
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
}) as const;
