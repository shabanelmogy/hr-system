"use client";

import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import {
  Box,
  Breadcrumbs,
  Drawer,
  IconButton,
  Link as MuiLink,
  Paper,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useMemo, useState } from "react";
import FeatureModuleNavigation from "./FeatureModuleNavigation";
import { findActiveNavigationTrail } from "./navigation";
import type { FeatureModuleLayoutProps } from "./types";

const expandedSidebarWidth = 272;
const compactSidebarWidth = 64;

export default function FeatureModuleLayout({
  title,
  description,
  moduleHref,
  moduleIcon,
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
  const navigationId = useId();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopExpanded, setDesktopExpanded] = useState(true);
  const activeTrail = useMemo(
    () => (pathname === moduleHref ? [] : findActiveNavigationTrail(items, pathname)),
    [items, moduleHref, pathname],
  );

  return (
    <Box sx={{ minWidth: 0 }}>
      <ModuleContextBar
        title={title}
        description={description}
        moduleHref={moduleHref}
        moduleIcon={moduleIcon}
        backLabel={backLabel}
        backHref={backHref}
        activeTrail={activeTrail}
        breadcrumbLabel={navigationLabel}
        openNavigationLabel={openNavigationLabel}
        navigationId={navigationId}
        onOpenNavigation={() => setMobileOpen(true)}
      />

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            lg: `${desktopExpanded ? expandedSidebarWidth : compactSidebarWidth}px minmax(0, 1fr)`,
          },
          alignItems: "start",
          gap: { xs: 0, lg: 2 },
          minWidth: 0,
          transition: theme.transitions.create("grid-template-columns", {
            duration: theme.transitions.duration.shortest,
          }),
        }}
      >
        <Paper
          component="aside"
          elevation={0}
          sx={{
            display: { xs: "none", lg: "block" },
            width: desktopExpanded ? expandedSidebarWidth : compactSidebarWidth,
            height: "calc(100vh - 126px)",
            minHeight: 480,
            position: "sticky",
            top: 88,
            overflow: "hidden",
            border: 1,
            borderColor: "divider",
            borderRadius: 1,
            backgroundColor: alpha(theme.palette.background.paper, 0.82),
            transition: theme.transitions.create("width", {
              duration: theme.transitions.duration.shortest,
            }),
          }}
        >
          <FeatureModuleNavigation
            title={title}
            moduleIcon={moduleIcon}
            navigationLabel={navigationLabel}
            openNavigationLabel={openNavigationLabel}
            closeNavigationLabel={closeNavigationLabel}
            backLabel={backLabel}
            backHref={backHref}
            items={items}
            pathname={pathname}
            compact={!desktopExpanded}
            onClose={() => setDesktopExpanded(false)}
            onExpand={() => setDesktopExpanded(true)}
          />
        </Paper>

        <Box component="section" sx={{ minWidth: 0, width: "100%" }}>
          {children}
        </Box>
      </Box>

      <Drawer
        id={navigationId}
        anchor={theme.direction === "rtl" ? "right" : "left"}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        slotProps={{
          paper: {
            sx: {
              width: expandedSidebarWidth,
              maxWidth: "88vw",
              borderRadius: 0,
            },
          },
        }}
      >
        <FeatureModuleNavigation
          title={title}
          moduleIcon={moduleIcon}
          navigationLabel={navigationLabel}
          openNavigationLabel={openNavigationLabel}
          closeNavigationLabel={closeNavigationLabel}
          backLabel={backLabel}
          backHref={backHref}
          items={items}
          pathname={pathname}
          onNavigate={() => setMobileOpen(false)}
          onClose={() => setMobileOpen(false)}
        />
      </Drawer>
    </Box>
  );
}

function ModuleContextBar({
  title,
  description,
  moduleHref,
  moduleIcon,
  backLabel,
  backHref,
  activeTrail,
  breadcrumbLabel,
  openNavigationLabel,
  navigationId,
  onOpenNavigation,
}: Pick<
  FeatureModuleLayoutProps,
  "title" | "description" | "moduleHref" | "moduleIcon" | "backLabel" | "backHref"
> & {
  activeTrail: ReturnType<typeof findActiveNavigationTrail>;
  breadcrumbLabel: string;
  openNavigationLabel: string;
  navigationId: string;
  onOpenNavigation: () => void;
}) {
  const theme = useTheme();

  return (
    <Box
      component="header"
      sx={{
        display: "flex",
        minHeight: 46,
        alignItems: "center",
        gap: 1,
        mb: 1.25,
        pb: 0.75,
        borderBottom: 1,
        borderColor: "divider",
      }}
    >
      <IconButton
        onClick={onOpenNavigation}
        aria-label={openNavigationLabel}
        aria-controls={navigationId}
        sx={{ display: { xs: "inline-flex", lg: "none" }, border: 1, borderColor: "divider" }}
      >
        <MenuRoundedIcon />
      </IconButton>

      <Box
        aria-hidden
        sx={{
          display: { xs: "grid", sm: "none" },
          width: 38,
          height: 38,
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
        <Box sx={{ display: { xs: "none", sm: "block" } }}>
          <Breadcrumbs
            aria-label={breadcrumbLabel}
            maxItems={5}
            separator={
              <ChevronRightRoundedIcon
                fontSize="small"
                sx={{ transform: theme.direction === "rtl" ? "scaleX(-1)" : "none" }}
              />
            }
          >
            <MuiLink component={Link} href={backHref} underline="hover" color="text.secondary">
              {backLabel}
            </MuiLink>
            {activeTrail.length === 0 ? (
              <Typography color="text.primary" aria-current="page" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
            ) : (
              <MuiLink
                component={Link}
                href={moduleHref}
                underline="hover"
                color="text.secondary"
              >
                {title}
              </MuiLink>
            )}
            {activeTrail.map((item, index) => {
              const current = index === activeTrail.length - 1;
              return item.href && item.href !== moduleHref && !current ? (
                <MuiLink
                  key={item.id}
                  component={Link}
                  href={item.href}
                  underline="hover"
                  color="text.secondary"
                >
                  {item.label}
                </MuiLink>
              ) : (
                <Typography key={item.id} color="text.primary" sx={{ fontWeight: 700 }}>
                  {item.label}
                </Typography>
              );
            })}
          </Breadcrumbs>
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ display: { xs: "block", sm: "none" }, fontWeight: 800 }}
          noWrap
        >
          {activeTrail.at(-1)?.label ?? title}
        </Typography>
        {description && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: "block", md: "none" } }}
            noWrap
          >
            {description}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
