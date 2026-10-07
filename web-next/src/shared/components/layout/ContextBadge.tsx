"use client";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Box,
  ButtonBase,
  CircularProgress,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { isValidElement, type MouseEventHandler, type ReactNode } from "react";

export interface ContextBadgeProps {
  /** The scope name, for example Current tenant or Current company. */
  label: string;
  /** The active context value shown to the user. */
  value: string;
  icon: ReactNode;
  compact?: boolean;
  iconOnly?: boolean;
  loading?: boolean;
  disabled?: boolean;
  error?: boolean;
  tone?: ContextBadgeTone;
  expandable?: boolean;
  expanded?: boolean;
  onClick?: MouseEventHandler<HTMLElement>;
}

export type ContextBadgeTone = "primary" | "secondary" | "info" | "warning" | "success";

/**
 * Domain-neutral presentation for global context identity and selector triggers.
 * Data loading, authorization and context mutation stay with the owning feature.
 */
export function ContextBadge({
  label,
  value,
  icon,
  compact = false,
  iconOnly = false,
  loading = false,
  disabled = false,
  error = false,
  tone = "primary",
  expandable = false,
  expanded = false,
  onClick,
}: ContextBadgeProps) {
  const accessibleLabel = value ? `${label}: ${value}` : label;
  const accentColor = error ? "error.main" : `${tone}.main`;
  const interactive = Boolean(onClick) && !disabled && !loading;
  const renderedIcon = loading ? (
    <CircularProgress size={17} color="inherit" />
  ) : isValidElement(icon) ? (
    icon
  ) : null;

  const content = (
    <>
      <Box
        className="ContextBadge-icon"
        aria-hidden
        sx={{
          ...iconSx,
          color: accentColor,
          // Dim only the icon when unavailable; dimming the text breaks the 4.5:1 contrast.
          opacity: disabled && !loading ? 0.62 : 1,
          bgcolor: (theme) => alpha(
            (error ? theme.palette.error : theme.palette[tone]).main,
            theme.palette.mode === "dark" ? 0.22 : 0.13,
          ),
        }}
      >
        {renderedIcon}
      </Box>
      {!iconOnly ? (
        <Typography
          className="ContextBadge-value"
          component="span"
          sx={contextValueSx}
        >
          {value || label}
        </Typography>
      ) : null}
      {expandable && !iconOnly ? (
        <ExpandMoreRoundedIcon
          aria-hidden
          className="ContextBadge-expand"
          sx={{
            flexShrink: 0,
            width: 17,
            height: 17,
            color: "text.secondary",
            transform: expanded ? "rotate(180deg)" : "none",
            transition: (theme) => theme.transitions.create("transform"),
          }}
        />
      ) : null}
    </>
  );

  const commonSx = {
    ...badgeRootSx,
    width: iconOnly ? 34 : "auto",
    minWidth: iconOnly ? 34 : compact ? 76 : 96,
    maxWidth: iconOnly ? 34 : compact ? 124 : 168,
    borderColor: (theme: import("@mui/material/styles").Theme) =>
      alpha(error ? theme.palette.error.main : theme.palette.divider, 0.82),
    cursor: interactive ? "pointer" : "default",
  } as const;

  return (
    <Tooltip title={accessibleLabel} enterDelay={500}>
      {interactive ? (
        <ButtonBase
          className="ContextBadge-root"
          aria-expanded={expandable ? expanded : undefined}
          aria-haspopup={expandable ? "menu" : undefined}
          aria-label={accessibleLabel}
          onClick={onClick}
          sx={commonSx}
        >
          {content}
        </ButtonBase>
      ) : (
        <Box role="group" aria-label={accessibleLabel} className="ContextBadge-root" component="span" sx={commonSx}>
          {content}
        </Box>
      )}
    </Tooltip>
  );
}

const badgeRootSx = {
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  gap: 0.5,
  flexShrink: 1,
  minWidth: 0,
  px: 0.875,
  borderRadius: 1.5,
  color: "text.primary",
  bgcolor: (theme: import("@mui/material/styles").Theme) =>
    alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.8 : 0.92),
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "transparent",
  transition: (theme: import("@mui/material/styles").Theme) =>
    theme.transitions.create(["background-color", "border-color"]),
  "&:hover": {
    bgcolor: (theme: import("@mui/material/styles").Theme) =>
      alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.14 : 0.07),
    borderColor: "primary.main",
  },
  "&.Mui-focusVisible": {
    outline: (theme: import("@mui/material/styles").Theme) =>
      `3px solid ${alpha(theme.palette.primary.main, 0.28)}`,
    outlineOffset: 2,
  },
} as const;

const iconSx = {
  width: 22,
  height: 22,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  borderRadius: 1,
  "& > svg": { width: 16, height: 16 },
} as const;

const contextValueSx = {
  display: "block",
  minWidth: 0,
  color: "text.primary",
  fontSize: "0.75rem",
  fontWeight: 700,
  lineHeight: 1.2,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;
