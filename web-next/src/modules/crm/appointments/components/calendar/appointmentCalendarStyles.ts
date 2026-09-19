import { alpha, type Theme } from "@mui/material/styles";

export const appointmentCalendarStyles = (theme: Theme) => ({
  p: { xs: 1, sm: 2 },
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.9)
      : theme.palette.background.paper,
  borderRadius: 2,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 0 1px rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.4)"
      : "0 2px 8px rgba(0,0,0,0.06)",
  "--fc-classic-background": theme.palette.background.paper,
  "--fc-classic-faint":
    theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
  "--fc-classic-muted": alpha(theme.palette.primary.main, 0.08),
  "--fc-classic-strong": alpha(theme.palette.primary.main, 0.16),
  "--fc-classic-foreground": theme.palette.text.primary,
  "--fc-classic-faint-foreground": theme.palette.text.disabled,
  "--fc-classic-muted-foreground": theme.palette.text.secondary,
  "--fc-classic-border": theme.palette.divider,
  "--fc-classic-strong-border": alpha(theme.palette.primary.main, 0.45),
  "--fc-classic-primary": theme.palette.primary.main,
  "--fc-classic-primary-foreground": theme.palette.primary.contrastText,
  "--fc-classic-event": theme.palette.primary.main,
  "--fc-classic-event-contrast": theme.palette.primary.contrastText,
  "--fc-classic-highlight": alpha(theme.palette.primary.main, 0.15),
  "--fc-classic-today": alpha(theme.palette.primary.main, 0.12),
  "--fc-classic-button": "transparent",
  "--fc-classic-button-border": alpha(theme.palette.divider, 0.6),
  "--fc-classic-button-strong": alpha(theme.palette.primary.main, 0.12),
  "--fc-classic-button-strong-border": alpha(theme.palette.primary.main, 0.6),
  "--fc-classic-button-foreground": theme.palette.text.secondary,
  fontFamily: theme.typography.fontFamily,
  "& .erp-calendar-toolbar": { gap: 1, flexWrap: "wrap" },
  "& .erp-calendar-toolbar-section": { display: "flex", flexWrap: "wrap", gap: 0.25 },
  "& .erp-calendar-toolbar-title": { color: theme.palette.text.primary, fontWeight: 700 },
  "& .erp-calendar-button": {
    textTransform: "none",
    borderRadius: 1.5,
    boxShadow: "none",
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
    transition: theme.transitions.create(["background-color", "border-color", "color"]),
    fontWeight: 600,
  },
  "& .erp-calendar-button:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    borderColor: alpha(theme.palette.primary.main, 0.6),
  },
  '& .erp-calendar-button[aria-pressed="true"]': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.dark,
  },
  "& .erp-calendar-button:disabled": {
    opacity: 0.6,
    backgroundColor: alpha(theme.palette.action.disabledBackground, 0.08),
    color: theme.palette.text.disabled,
    borderColor: alpha(theme.palette.divider, 0.4),
  },
  "& .erp-calendar-day-header": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.02)
        : alpha(theme.palette.primary.main, 0.04),
  },
  "& .erp-calendar-day-header-inner, & .erp-calendar-day-number": {
    color: theme.palette.text.secondary,
  },
  "& .erp-calendar-table": {
    borderColor: theme.palette.divider,
    backgroundColor: "transparent",
    borderRadius: 1.5,
  },
  "& .erp-calendar-slot": { borderColor: theme.palette.divider },
  "& .erp-calendar-day-today": { backgroundColor: alpha(theme.palette.primary.main, 0.12) },
  "& .erp-calendar-view": { backgroundColor: "transparent" },
  [theme.breakpoints.down("md")]: {
    "& .erp-calendar-toolbar": { alignItems: "stretch" },
    "& .erp-calendar-toolbar-title": { fontSize: theme.typography.h6.fontSize },
    "& .erp-calendar-button": { paddingInline: 1, fontSize: theme.typography.caption.fontSize },
  },
  [theme.breakpoints.down("sm")]: {
    "& .erp-calendar-toolbar": { flexDirection: "column", alignItems: "center" },
    "& .erp-calendar-toolbar-section": { justifyContent: "center" },
  },
  "@media (prefers-reduced-motion: reduce)": {
    "& .erp-calendar-button": { transition: "none" },
  },
});
