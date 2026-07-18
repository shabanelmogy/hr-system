import { Box, ToggleButton, ToggleButtonGroup, Tooltip, useTheme } from "@mui/material";
import { cloneElement, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";
import type { ViewOption, ViewType } from "./types";

type ViewToggleProps = {
  value: ViewType;
  options: ViewOption[];
  compact?: boolean;
  showLabels?: boolean;
  onChange: (event: MouseEvent<HTMLElement> | null, value: ViewType | null) => void;
};

export default function ViewToggle(props: ViewToggleProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  return (
    <ToggleButtonGroup
      value={props.value}
      exclusive
      onChange={props.onChange}
      aria-label={t("navigation.viewType")}
      size="small"
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: props.compact ? 1 : 2,
        minWidth: 0,
        maxWidth: "100%",
        overflowX: props.compact ? "visible" : "auto",
        scrollbarWidth: "thin",
        boxShadow: props.compact ? `0 1px 3px ${theme.palette.divider}` : undefined,
        "& .MuiToggleButton-root": {
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: `${props.compact ? 4 : 8}px !important`,
          mx: props.compact ? 0.125 : 0.25,
          px: props.compact ? { xs: 0.25, sm: 0.5 } : { md: 1, lg: 1.5 },
          py: props.compact ? 0.5 : 0.75,
          minWidth: props.compact ? { xs: 28, sm: 32 } : undefined,
          height: props.compact ? { xs: 28, sm: 32 } : undefined,
          flexShrink: 0,
          whiteSpace: "nowrap",
          transition: "all 0.2s ease-in-out",
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            boxShadow: `0 2px 8px ${theme.palette.primary.main}40`,
            "&:hover": { backgroundColor: theme.palette.primary.dark },
          },
          "&:hover": { backgroundColor: theme.palette.action.hover },
        },
      }}
    >
      {props.options.map((option) => (
        <ToggleButton key={option.value} value={option.value} aria-label={option.label}>
          <Tooltip title={option.label} arrow>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              {props.compact ? cloneElement(option.icon, { fontSize: "small" }) : option.icon}
              {props.showLabels && (
                <Box
                  sx={{
                    marginInlineStart: 1,
                    display: { md: "none", lg: "block" },
                  }}
                >
                  {option.label}
                </Box>
              )}
            </Box>
          </Tooltip>
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}
