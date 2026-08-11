"use client";

import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import KeyboardDoubleArrowLeftRoundedIcon from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import {
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { flattenFeatureNavigation, isFeaturePathActive } from "./navigation";
import type { FeatureModuleLayoutProps, FeatureModuleNavigationItem } from "./types";

interface FeatureModuleNavigationProps
  extends Pick<
    FeatureModuleLayoutProps,
    | "title"
    | "moduleIcon"
    | "navigationLabel"
    | "closeNavigationLabel"
    | "openNavigationLabel"
    | "backLabel"
    | "backHref"
    | "items"
  > {
  pathname: string;
  compact?: boolean;
  onNavigate?: () => void;
  onClose?: () => void;
  onExpand?: () => void;
}

export default function FeatureModuleNavigation({
  title,
  moduleIcon,
  navigationLabel,
  closeNavigationLabel,
  openNavigationLabel,
  backLabel,
  backHref,
  items,
  pathname,
  compact = false,
  onNavigate,
  onClose,
  onExpand,
}: FeatureModuleNavigationProps) {
  const theme = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const isItemActive = (item: FeatureModuleNavigationItem): boolean => {
    if (item.children?.some(isItemActive)) return true;
    return Boolean(item.href && isFeaturePathActive(pathname, item.href));
  };

  const renderItems = (
    navigationItems: readonly FeatureModuleNavigationItem[],
    level = 0,
  ): ReactNode =>
    navigationItems.map((item) => {
      const hasChildren = Boolean(item.children?.length);
      const active = isItemActive(item);
      const expanded = expandedGroups[item.id] ?? active;

      if (hasChildren) {
        return (
          <Box key={item.id}>
            <ListItemButton
              onClick={() =>
                setExpandedGroups((current) => ({ ...current, [item.id]: !expanded }))
              }
              selected={active}
              aria-expanded={expanded}
              sx={navigationItemSx(theme, level)}
            >
              <ListItemIcon sx={navigationIconSx(active)}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                slotProps={{ primary: { noWrap: true, sx: { fontWeight: active ? 700 : 600 } } }}
              />
              {expanded ? (
                <ExpandLessRoundedIcon fontSize="small" />
              ) : (
                <ExpandMoreRoundedIcon fontSize="small" />
              )}
            </ListItemButton>
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <List disablePadding>{renderItems(item.children ?? [], level + 1)}</List>
            </Collapse>
          </Box>
        );
      }

      if (!item.href) return null;

      return (
        <ListItemButton
          key={item.id}
          component={Link}
          href={item.href}
          onClick={onNavigate}
          selected={active}
          aria-current={active ? "page" : undefined}
          sx={navigationItemSx(theme, level)}
        >
          <ListItemIcon sx={navigationIconSx(active)}>{item.icon}</ListItemIcon>
          <ListItemText
            primary={item.label}
            slotProps={{ primary: { noWrap: true, sx: { fontWeight: active ? 700 : 500 } } }}
          />
        </ListItemButton>
      );
    });

  if (compact) {
    const compactItems = flattenFeatureNavigation(items);

    return (
      <Stack component="nav" aria-label={navigationLabel} sx={{ height: "100%", py: 1 }}>
        <Tooltip title={openNavigationLabel} placement={theme.direction === "rtl" ? "left" : "right"}>
          <IconButton
            onClick={onExpand}
            aria-label={openNavigationLabel}
            sx={{ alignSelf: "center", width: 42, height: 42, mb: 1 }}
          >
            <KeyboardDoubleArrowLeftRoundedIcon
              sx={{ transform: theme.direction === "rtl" ? "none" : "scaleX(-1)" }}
            />
          </IconButton>
        </Tooltip>
        <Divider />
        <CompactNavigationLink
          label={backLabel}
          href={backHref}
          icon={<DashboardRoundedIcon fontSize="small" />}
          active={pathname === backHref}
          onNavigate={onNavigate}
        />
        <Divider sx={{ mx: 1, my: 0.5 }} />
        <Box sx={{ minHeight: 0, overflowY: "auto", overflowX: "hidden" }}>
          {compactItems.map((item) => (
            <CompactNavigationLink
              key={item.id}
              label={item.label}
              href={item.href!}
              icon={item.icon}
              active={isItemActive(item)}
              onNavigate={onNavigate}
            />
          ))}
        </Box>
      </Stack>
    );
  }

  return (
    <Stack component="nav" aria-label={navigationLabel} sx={{ height: "100%", minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 2, py: 1.75 }}>
        <Box
          aria-hidden
          sx={{
            display: "grid",
            width: 40,
            height: 40,
            flexShrink: 0,
            placeItems: "center",
            borderRadius: 1,
            color: "primary.main",
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          }}
        >
          {moduleIcon}
        </Box>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", fontWeight: 700 }}
            noWrap
          >
            {navigationLabel}
          </Typography>
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }} noWrap>
            {title}
          </Typography>
        </Box>
        {onClose && (
          <IconButton size="small" onClick={onClose} aria-label={closeNavigationLabel}>
            <ChevronLeftRoundedIcon
              sx={{ transform: theme.direction === "rtl" ? "scaleX(-1)" : "none" }}
            />
          </IconButton>
        )}
      </Box>

      <Divider />
      <Box sx={{ minHeight: 0, flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <List disablePadding sx={{ px: 1, py: 1 }}>
          <ListItemButton
            component={Link}
            href={backHref}
            onClick={onNavigate}
            sx={{
              minHeight: 44,
              mb: 0.75,
              borderRadius: 1,
              color: "text.secondary",
              "&:hover": {
                color: "text.primary",
                backgroundColor: alpha(theme.palette.primary.main, 0.07),
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 38, color: "inherit" }}>
              <DashboardRoundedIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={backLabel} />
          </ListItemButton>
          <Divider sx={{ mb: 1 }} />
          {renderItems(items)}
        </List>
      </Box>
    </Stack>
  );
}

function CompactNavigationLink({
  label,
  href,
  icon,
  active,
  onNavigate,
}: {
  label: string;
  href: FeatureModuleNavigationItem["href"];
  icon: ReactNode;
  active: boolean;
  onNavigate?: () => void;
}) {
  const theme = useTheme();
  if (!href) return null;

  return (
    <Tooltip title={label} placement={theme.direction === "rtl" ? "left" : "right"}>
      <ListItemButton
        component={Link}
        href={href}
        onClick={onNavigate}
        selected={active}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        sx={{
          width: 44,
          minHeight: 44,
          mx: "auto",
          my: 0.5,
          justifyContent: "center",
          borderRadius: 1,
          color: active ? "primary.main" : "text.secondary",
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 0, justifyContent: "center", color: "inherit" }}>
          {icon}
        </ListItemIcon>
      </ListItemButton>
    </Tooltip>
  );
}

function navigationIconSx(active: boolean) {
  return {
    minWidth: 38,
    color: active ? "primary.main" : "text.secondary",
  } as const;
}

function navigationItemSx(theme: Theme, level: number) {
  return {
    position: "relative",
    minHeight: 44,
    mb: 0.5,
    borderRadius: 1,
    paddingInlineStart: theme.spacing(1.25 + level * 1.5),
    "&.Mui-selected": {
      color: "primary.main",
      backgroundColor: alpha(theme.palette.primary.main, level === 0 ? 0.11 : 0.08),
      "&::before": {
        content: '""',
        position: "absolute",
        insetInlineStart: 0,
        top: 9,
        bottom: 9,
        width: 3,
        borderRadius: 2,
        backgroundColor: "primary.main",
      },
      "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.15) },
    },
    "&:hover": { backgroundColor: alpha(theme.palette.action.hover, 0.08) },
  } as const;
}
