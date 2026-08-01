"use client";

import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import {
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ReactNode } from "react";
import type { AppPath } from "@/config/routes";

export interface FeatureModuleNavigationItem {
  id: string;
  label: string;
  href?: AppPath;
  icon: ReactNode;
  children?: readonly FeatureModuleNavigationItem[];
}

export interface FeatureModuleLayoutProps {
  title: string;
  description?: string;
  navigationLabel: string;
  openNavigationLabel: string;
  closeNavigationLabel: string;
  backLabel: string;
  backHref: AppPath;
  items: readonly FeatureModuleNavigationItem[];
  children: ReactNode;
}

const sidebarWidth = 248;

function isPathActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function ModuleNavigation({
  title,
  navigationLabel,
  closeNavigationLabel,
  backLabel,
  backHref,
  items,
  pathname,
  onNavigate,
  onClose,
}: Pick<
  FeatureModuleLayoutProps,
  "title" | "navigationLabel" | "closeNavigationLabel" | "backLabel" | "backHref" | "items"
> & {
  pathname: string;
  onNavigate?: () => void;
  onClose?: () => void;
}) {
  const theme = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const isItemActive = (item: FeatureModuleNavigationItem): boolean => {
    if (item.href && isPathActive(pathname, item.href)) return true;
    return item.children?.some(isItemActive) ?? false;
  };

  const renderItems = (
    navigationItems: readonly FeatureModuleNavigationItem[],
    level = 0,
  ): ReactNode => navigationItems.map((item) => {
    const hasChildren = Boolean(item.children?.length);
    const active = isItemActive(item);
    const expanded = expandedGroups[item.id] ?? active;
    const itemPadding = 1.5 + level * 1.5;

    if (hasChildren) {
      return (
        <Box key={item.id}>
          <ListItemButton
            onClick={() => setExpandedGroups((current) => ({ ...current, [item.id]: !expanded }))}
            selected={active}
            aria-expanded={expanded}
            sx={{
              minHeight: 46,
              borderRadius: 1,
              mb: 0.5,
              paddingInlineStart: theme.spacing(itemPadding),
              "&.Mui-selected": {
                color: "primary.main",
                backgroundColor: alpha(theme.palette.primary.main, 0.12),
                "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.18) },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 36, color: active ? "primary.main" : "text.secondary" }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: active ? 700 : 600 } } }} />
            {expanded ? <ExpandLessRoundedIcon fontSize="small" /> : <ExpandMoreRoundedIcon fontSize="small" />}
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
        sx={{
          minHeight: 46,
          borderRadius: 1,
          mb: 0.5,
          paddingInlineStart: theme.spacing(itemPadding),
          "&.Mui-selected": {
            color: "primary.main",
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            "&:hover": { backgroundColor: alpha(theme.palette.primary.main, 0.18) },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 36, color: active ? "primary.main" : "text.secondary" }}>
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.label} slotProps={{ primary: { sx: { fontWeight: active ? 700 : 500 } } }} />
      </ListItemButton>
    );
  });

  return (
    <Stack component="nav" aria-label={navigationLabel} sx={{ height: "100%", minWidth: 0 }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, px: 2.25, py: 2 }}>
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Typography variant="overline" color="text.secondary" sx={{ display: "block", fontWeight: 700, letterSpacing: 0 }}>
            {navigationLabel}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
            {title}
          </Typography>
        </Box>
        {onClose && (
          <IconButton
            size="small"
            onClick={onClose}
            aria-label={closeNavigationLabel}
            sx={{ flexShrink: 0 }}
          >
            <ChevronLeftRoundedIcon sx={{ transform: theme.direction === "rtl" ? "scaleX(-1)" : "none" }} />
          </IconButton>
        )}
      </Box>
      <Divider />
      <List disablePadding sx={{ px: 1, py: 1 }}>
        <ListItemButton
          component={Link}
          href={backHref}
          onClick={onNavigate}
          sx={{
            minHeight: 44,
            borderRadius: 1,
            mb: 0.5,
            color: "text.secondary",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
              color: "text.primary",
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 36, color: "inherit" }}>
            <HomeRoundedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary={backLabel} />
        </ListItemButton>

        {renderItems(items)}
      </List>
    </Stack>
  );
}

export default function FeatureModuleLayout({
  title,
  description,
  navigationLabel,
  openNavigationLabel,
  closeNavigationLabel,
  backLabel,
  backHref,
  items,
  children,
}: FeatureModuleLayoutProps) {
  const theme = useTheme();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const closeMobileNavigation = () => setMobileOpen(false);

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box sx={{ display: { xs: "flex", lg: "none" }, alignItems: "center", gap: 1, mb: 2 }}>
        <IconButton
          onClick={() => setMobileOpen(true)}
          aria-label={openNavigationLabel}
          aria-controls="feature-module-navigation"
          sx={{ border: 1, borderColor: "divider" }}
        >
          <MenuRoundedIcon />
        </IconButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }} noWrap>{title}</Typography>
          {description && <Typography variant="body2" color="text.secondary" noWrap>{description}</Typography>}
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "flex-start", gap: { xs: 0, lg: 2 }, minWidth: 0, direction: theme.direction }}>
        <Paper
          component="aside"
          elevation={0}
          sx={{
            display: { xs: "none", lg: "block" },
            width: desktopSidebarOpen ? sidebarWidth : 0,
            flex: `0 0 ${desktopSidebarOpen ? sidebarWidth : 0}px`,
            overflow: "hidden",
            border: desktopSidebarOpen ? 1 : 0,
            borderColor: desktopSidebarOpen ? "divider" : "transparent",
            borderRadius: 1.5,
            position: "sticky",
            top: 88,
            opacity: desktopSidebarOpen ? 1 : 0,
            pointerEvents: desktopSidebarOpen ? "auto" : "none",
            transition: theme.transitions.create(["width", "flex-basis", "opacity"], {
              duration: theme.transitions.duration.shortest,
            }),
          }}
        >
          <ModuleNavigation
            title={title}
            navigationLabel={navigationLabel}
            closeNavigationLabel={closeNavigationLabel}
            backLabel={backLabel}
            backHref={backHref}
            items={items}
            pathname={pathname}
            onClose={() => setDesktopSidebarOpen(false)}
          />
        </Paper>

        <Box component="section" sx={{ minWidth: 0, flex: 1, width: "100%" }}>
          <Box sx={{ display: { xs: "none", lg: "block" }, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {!desktopSidebarOpen && (
                <IconButton
                  onClick={() => setDesktopSidebarOpen(true)}
                  aria-label={openNavigationLabel}
                  aria-controls="feature-module-navigation"
                  sx={{ border: 1, borderColor: "divider" }}
                >
                  <MenuRoundedIcon fontSize="small" />
                </IconButton>
              )}
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{title}</Typography>
            </Box>
            {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
          </Box>
          {children}
        </Box>
      </Box>

      <Drawer
        id="feature-module-navigation"
        anchor={theme.direction === "rtl" ? "right" : "left"}
        open={mobileOpen}
        onClose={closeMobileNavigation}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { width: sidebarWidth, maxWidth: "85vw" } } }}
      >
        <Box sx={{ pt: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", px: 1 }}>
            <IconButton onClick={closeMobileNavigation} aria-label={closeNavigationLabel}>
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <ModuleNavigation
            title={title}
            navigationLabel={navigationLabel}
            closeNavigationLabel={closeNavigationLabel}
            backLabel={backLabel}
            backHref={backHref}
            items={items}
            pathname={pathname}
            onNavigate={closeMobileNavigation}
          />
        </Box>
      </Drawer>
    </Box>
  );
}
