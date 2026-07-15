import { alpha, type Theme } from "@mui/material/styles";

export const appointmentCalendarStyles = (theme: Theme) => ({
  p: 2,
  bgcolor:
    theme.palette.mode === "dark"
      ? alpha(theme.palette.background.paper, 0.9)
      : theme.palette.background.paper,
  borderRadius: 2,
  boxShadow:
    theme.palette.mode === "dark"
      ? "0 0 0 1px rgba(255,255,255,0.03), 0 8px 24px rgba(0,0,0,0.4)"
      : "0 2px 8px rgba(0,0,0,0.06)",
  "& .fc": {
    "--fc-page-bg-color": theme.palette.background.default,
    "--fc-page-text-color": theme.palette.text.primary,
    "--fc-neutral-bg-color":
      theme.palette.mode === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)",
    "--fc-neutral-text-color": theme.palette.text.secondary,
    "--fc-border-color": theme.palette.divider,
    "--fc-list-event-hover-bg-color": alpha(theme.palette.primary.main, 0.1),
    "--fc-today-bg-color": alpha(theme.palette.primary.main, 0.15),
    "--fc-event-bg-color": theme.palette.primary.main,
    "--fc-event-border-color": theme.palette.primary.dark,
    "--fc-event-text-color": theme.palette.primary.contrastText,
    "--fc-button-bg-color": theme.palette.primary.main,
    "--fc-button-border-color": theme.palette.primary.dark,
    "--fc-button-text-color": theme.palette.primary.contrastText,
    "--fc-button-hover-bg-color": theme.palette.primary.dark,
    "--fc-button-active-bg-color": theme.palette.primary.dark,
    fontFamily: theme.typography.fontFamily,
  },
  "& .fc .fc-toolbar": { gap: 8 },
  "& .fc .fc-toolbar-title": { color: theme.palette.text.primary, fontWeight: 700 },
  "& .fc .fc-button": {
    textTransform: "none",
    borderRadius: 1.5,
    boxShadow: "none",
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
    transition: "all .2s ease",
    fontWeight: 600,
  },
  "& .fc .fc-button:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    borderColor: alpha(theme.palette.primary.main, 0.6),
  },
  '& .fc .fc-button.fc-button-active, & .fc .fc-button[aria-pressed="true"]': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    borderColor: theme.palette.primary.dark,
  },
  "& .fc .fc-today-button": {
    backgroundColor: theme.palette.secondary.main,
    color: theme.palette.secondary.contrastText,
    borderColor: theme.palette.secondary.dark,
  },
  "& .fc .fc-today-button:hover": {
    backgroundColor: theme.palette.secondary.dark,
    borderColor: theme.palette.secondary.dark,
  },
  "& .fc .fc-button.fc-button-disabled, & .fc .fc-today-button.fc-button-disabled": {
    opacity: 0.6,
    backgroundColor: alpha(theme.palette.action.disabledBackground || theme.palette.divider, 0.08),
    color: theme.palette.text.disabled,
    borderColor: alpha(theme.palette.divider, 0.4),
  },
  "& .fc .fc-prev-button, & .fc .fc-next-button": {
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    border: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
  },
  "& .fc .fc-prev-button:hover, & .fc .fc-next-button:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.12),
    color: theme.palette.primary.main,
    borderColor: alpha(theme.palette.primary.main, 0.6),
  },
  "& .fc .fc-col-header": {
    backgroundColor:
      theme.palette.mode === "dark"
        ? alpha(theme.palette.common.white, 0.02)
        : alpha(theme.palette.primary.main, 0.04),
  },
  "& .fc .fc-col-header-cell-cushion": { color: theme.palette.text.secondary },
  "& .fc .fc-daygrid-day-number": { color: theme.palette.text.secondary },
  "& .fc .fc-scrollgrid": {
    borderColor: theme.palette.divider,
    backgroundColor: "transparent",
    borderRadius: 1.5,
  },
  "& .fc .fc-timegrid-slot": { borderColor: theme.palette.divider },
  "& .fc .fc-day-today": { backgroundColor: alpha(theme.palette.primary.main, 0.12) },
  "& .fc .fc-list": { backgroundColor: "transparent" },
});
