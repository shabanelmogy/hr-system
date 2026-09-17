import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  Box,
  CircularProgress,
  Fade,
  Stack,
  Typography,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";

import { appRoutes } from "@/config/routes";
import { useSession } from "@/lib/auth/SessionContext";
import { requiredModuleForPath, useModuleTranslations } from "@/platform/modules";
import { useTokenRevocation } from "@/platform/auth";
import SideBar from "../components/sidebar/SideBar";
import SidebarContext from "@/shared/contexts/SidebarContext";
import TopBar from "../components/top-bar/TopBar";
import ToolbarSpacer from "../components/top-bar/ToolbarSpacer";

const fallbackSidebarContextValue = {
  open: false,
  setOpen: (() => undefined) as React.Dispatch<React.SetStateAction<boolean>>,
};

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense
    fallback={(
      <SidebarContext.Provider value={fallbackSidebarContextValue}>
        {children}
      </SidebarContext.Provider>
    )}
  >
    <PathAwareMainLayout>{children}</PathAwareMainLayout>
  </React.Suspense>
);

const PathAwareMainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const desktopNavigation = useMediaQuery(theme.breakpoints.up("md"));
  const { t } = useTranslation();
  const { hasRole, isLoggingOut } = useSession();
  const pathname = usePathname();
  const [toolbarHeight, setToolbarHeight] = React.useState(64);
  const dedicatedLayoutRoute =
    pathname === appRoutes.shell.basicData ||
    pathname.startsWith(`${appRoutes.shell.basicData}/`);
  const isSuperAdminDashboard =
    pathname === appRoutes.platform.superAdmin.dashboard ||
    (pathname === appRoutes.shell.home && hasRole(["super_admin"]));
  const fixedHeightRoute =
    dedicatedLayoutRoute ||
    pathname === appRoutes.modules.hr.workforcePlanning.index ||
    pathname.startsWith(`${appRoutes.modules.hr.workforcePlanning.index}/`) ||
    pathname === appRoutes.modules.hr.attendanceDevices.index ||
    pathname.startsWith(`${appRoutes.modules.hr.attendanceDevices.index}/`) ||
    isSuperAdminDashboard ||
    pathname === appRoutes.platform.superAdmin.tenants;
  const sidebarScope = dedicatedLayoutRoute ? appRoutes.shell.basicData : "main";
  const activeModuleCode = requiredModuleForPath(pathname)?.moduleCode.toLowerCase() ?? null;
  useModuleTranslations(activeModuleCode);
  const isModuleLauncher =
    pathname === appRoutes.platform.apps.index ||
    (pathname === appRoutes.shell.home && !hasRole(["super_admin"]));
  const activeSidebarContextKey = activeModuleCode
    ? `${sidebarScope}:${activeModuleCode}`
    : null;
  const [sidebarState, setSidebarState] = React.useState({
    contextKey: null as string | null,
    open: false,
  });
  const defaultSidebarOpen =
    !isModuleLauncher && Boolean(activeSidebarContextKey) && desktopNavigation;
  const open = isModuleLauncher
    ? false
    : sidebarState.contextKey === activeSidebarContextKey
      ? sidebarState.open
      : defaultSidebarOpen;
  const setOpen = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
    (value) => {
      setSidebarState((current) => {
        const currentOpen = current.contextKey === activeSidebarContextKey
          ? current.open
          : defaultSidebarOpen;
        const nextOpen = typeof value === "function" ? value(currentOpen) : value;

        return { contextKey: activeSidebarContextKey, open: nextOpen };
      });
    },
    [activeSidebarContextKey, defaultSidebarOpen],
  );

  const handleDrawerClose = () => setOpen(false);
  const handleDrawerToggle = () => setOpen((current) => !current);

  useTokenRevocation();

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <Box
        dir="ltr"
        aria-hidden={isLoggingOut}
        sx={{
          display: "flex",
          flexDirection: theme.direction === "rtl" ? "row-reverse" : "row",
          width: "100%",
          minHeight: fixedHeightRoute ? 0 : "100vh",
          height: fixedHeightRoute ? "100dvh" : undefined,
          overflow: "hidden",
          bgcolor: "background.default",
          opacity: isLoggingOut ? 0 : 1,
          pointerEvents: isLoggingOut ? "none" : "auto",
          transition: theme.transitions.create("opacity", {
            duration: theme.transitions.duration.leavingScreen,
          }),
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
        }}
      >
        <TopBar
          open={open}
          handleDrawerToggle={handleDrawerToggle}
          onHeightChange={setToolbarHeight}
          showSidebarToggle={!isModuleLauncher}
        />

        {!isModuleLauncher && (
          <SideBar
            open={open}
            hideWhenClosed={false}
            handleDrawerClose={handleDrawerClose}
          />
        )}

        <Box
          component="main"
          dir={theme.direction}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            m: { xs: 1.5, sm: 2, md: 3 },
            ...(fixedHeightRoute && {
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
              overflow: "hidden",
            }),
          }}
        >
          <ToolbarSpacer style={{ height: toolbarHeight, minHeight: toolbarHeight }} sx={{ flexShrink: 0 }} />
          {fixedHeightRoute ? (
            <Box sx={{ display: "flex", flex: 1, flexDirection: "column", minHeight: 0 }}>
              {children}
            </Box>
          ) : (
            children
          )}
        </Box>
      </Box>

      <Fade
        in={isLoggingOut}
        timeout={theme.transitions.duration.shortest}
        unmountOnExit
      >
        <Box
          role="status"
          aria-live="polite"
          dir={theme.direction}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: theme.zIndex.modal + 1,
            display: "grid",
            placeItems: "center",
            px: 3,
            color: "text.primary",
            backgroundColor: alpha(theme.palette.background.default, 0.92),
            backdropFilter: "blur(4px)",
          }}
        >
          <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
            <Box
              sx={{
                position: "relative",
                display: "grid",
                width: 56,
                height: 56,
                placeItems: "center",
              }}
            >
              <CircularProgress size={56} thickness={2.5} />
              <LogoutRoundedIcon
                color="primary"
                sx={{ position: "absolute", fontSize: 24 }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("auth.signingOut")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("auth.signingOutDescription")}
            </Typography>
          </Stack>
        </Box>
      </Fade>
    </SidebarContext.Provider>
  );
};

export default MainLayout;
