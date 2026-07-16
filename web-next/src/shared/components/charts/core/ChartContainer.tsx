import type { ElementType, ReactNode } from "react";

import { ErrorOutlined, QueryStats, TrendingUp } from "@mui/icons-material";
import { alpha, Box, Paper, Skeleton, Typography, useTheme } from "@mui/material";
import type { PaperProps, SvgIconProps } from "@mui/material";
import { useTranslation } from "react-i18next";

const visuallyHidden = {
  border: 0,
  clip: "rect(0 0 0 0)",
  height: 1,
  margin: -1,
  overflow: "hidden",
  padding: 0,
  position: "absolute" as const,
  whiteSpace: "nowrap" as const,
  width: 1,
};

export interface ChartContainerProps extends Omit<PaperProps, "children" | "title"> {
  title?: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
  loading?: boolean;
  error?: unknown;
  errorMessage?: ReactNode;
  emptyMessage?: ReactNode;
  dataCount?: number;
  summary?: ReactNode;
  ariaLabel?: string;
  height?: number | string;
  gradient?: boolean;
  fullHeight?: boolean;
  icon?: ElementType<SvgIconProps>;
  actions?: ReactNode;
}

const ChartContainer = ({
  title,
  subtitle,
  children,
  loading = false,
  error = null,
  errorMessage,
  emptyMessage,
  dataCount,
  summary,
  ariaLabel,
  height = 400,
  elevation = 1,
  gradient = false,
  fullHeight = false,
  icon: Icon = TrendingUp,
  actions = null,
  sx,
  ...paperProps
}: ChartContainerProps) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const isEmpty = dataCount === 0;
  const accessibleLabel =
    ariaLabel ?? (typeof title === "string" ? title : t("chartCommon.label"));
  const accessibleSummary =
    summary ??
    (dataCount == null
      ? undefined
      : t("chartCommon.dataPointCount", { count: dataCount }));
  const rootSx = [
    {
      p: 3,
      m: 0,
      borderRadius: 2,
      background: gradient
        ? `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(theme.palette.background.default, 0.9)} 100%)`
        : theme.palette.background.paper,
      transition: "box-shadow 0.3s ease-in-out",
      "@media (prefers-reduced-motion: reduce)": { transition: "none" },
      "&:hover": { boxShadow: theme.shadows[4] },
      ...(fullHeight
        ? { height: "100%", display: "flex", flexDirection: "column", minHeight: height }
        : {}),
    },
    ...(Array.isArray(sx) ? sx : [sx]),
  ];

  if (loading) {
    return (
      <Paper
        component="figure"
        aria-label={accessibleLabel}
        aria-busy="true"
        elevation={elevation}
        sx={rootSx}
        {...paperProps}
      >
        {title && <Skeleton variant="text" width="30%" height={32} />}
        <Skeleton variant="rectangular" width="100%" height={height} sx={{ mt: 2, borderRadius: 1 }} />
      </Paper>
    );
  }

  const state = error
    ? {
        icon: ErrorOutlined,
        title: t("chartCommon.errorTitle"),
        message: errorMessage ?? t("chartCommon.errorMessage"),
        color: "error.main",
        role: "alert" as const,
      }
    : isEmpty
      ? {
          icon: QueryStats,
          title: t("chartCommon.emptyTitle"),
          message: emptyMessage ?? t("chartCommon.emptyMessage"),
          color: "text.secondary",
          role: "status" as const,
        }
      : null;

  return (
    <Paper
      component="figure"
      aria-label={accessibleLabel}
      elevation={elevation}
      sx={rootSx}
      {...paperProps}
    >
      {(title || actions) && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 2,
            mb: 3,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography
                variant="h6"
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  color: "primary.main",
                  fontWeight: 600,
                  mb: subtitle ? 0.5 : 0,
                }}
              >
                <Icon aria-hidden="true" sx={{ color: "primary.main", flexShrink: 0 }} />
                {title}
              </Typography>
            )}
            {subtitle && <Typography variant="body2" color="text.secondary">{subtitle}</Typography>}
          </Box>
          {actions && <Box sx={{ flexShrink: 0 }}>{actions}</Box>}
        </Box>
      )}

      <Box sx={{ width: "100%", ...(fullHeight ? { flex: 1, minHeight: 0 } : { height }) }}>
        {state ? (
          <Box
            role={state.role}
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              px: 2,
              textAlign: "center",
              color: state.color,
            }}
          >
            <state.icon aria-hidden="true" sx={{ fontSize: 40 }} />
            <Typography variant="h6" color="inherit">{state.title}</Typography>
            <Typography variant="body2" color="text.secondary">{state.message}</Typography>
          </Box>
        ) : children}
      </Box>

      {accessibleSummary && (
        <Box component="figcaption" sx={visuallyHidden}>
          {accessibleSummary}
        </Box>
      )}
    </Paper>
  );
};

export default ChartContainer;
