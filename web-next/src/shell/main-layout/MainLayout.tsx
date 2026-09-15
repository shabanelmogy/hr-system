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

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const desktopNavigation = useMediaQuery(theme.breakpoints.up("md"));
  const { t } = useTranslation();
  const { hasRole, isLoggingOut } = useSession();
  const pathname = usePathname();
  const [toolbarHeight, setToolbarHeight] = React.useState(64);
  const dedicatedLayoutRoute =
    pathname === appRoutes.basicData.index ||
    pathname.startsWith(`${appRoutes.basicData.index}/`);
  const isSuperAdminDashboard =
    pathname === appRoutes.superAdmin.dashboard ||
    (pathname === appRoutes.home && hasRole(["super_admin"]));
  const fixedHeightRoute =
    dedicatedLayoutRoute ||
    pathname === appRoutes.workforcePlanning.index ||
    pathname.startsWith(`${appRoutes.workforcePlanning.index}/`) ||
    pathname === appRoutes.attendanceDevices.index ||
    pathname.startsWith(`${appRoutes.attendanceDevices.index}/`) ||
    isSuperAdminDashboard ||
    pathname === appRoutes.superAdmin.tenants;
  const sidebarScope = dedicatedLayoutRoute ? appRoutes.basicData.index : "main";
  const activeModuleCode = requiredModuleForPath(pathname)?.moduleCode.toLowerCase() ?? null;
  useModuleTranslations(activeModuleCode);
  const isModuleLauncher =
    pathname === appRoutes.apps ||
    (pathname === appRoutes.home && !hasRole(["super_admin"]));
  const activeSidebarContextKey = activeModuleCode
    ? `${sidebarScope}:${activeModuleCode}`
    : null;
  const [sidebarState, setSidebarState] = React.useState({
    scope: "main",
    open: false,
  });
  const previousSidebarContextRef = React.useRef<string | null>(null);
  const open = sidebarState.scope === sidebarScope && sidebarState.open;
  const setOpen = React.useCallback<React.Dispatch<React.SetStateAction<boolean>>>(
    (value) => {
      setSidebarState((current) => {
        const currentOpen = current.scope === sidebarScope && current.open;
        const nextOpen = typeof value === "function" ? value(currentOpen) : value;

        return { scope: sidebarScope, open: nextOpen };
      });
    },
    [sidebarScope],
  );

  const handleDrawerClose = () => setOpen(false);
  const handleDrawerToggle = () => setOpen((current) => !current);

  React.useEffect(() => {
    if (isModuleLauncher) {
      setOpen(false);
      previousSidebarContextRef.current = null;
      return;
    }

    if (
      activeSidebarContextKey &&
      activeSidebarContextKey !== previousSidebarContextRef.current
    ) {
      setOpen(desktopNavigation);
    }

    previousSidebarContextRef.current = activeSidebarContextKey;
  }, [activeSidebarContextKey, desktopNavigation, isModuleLauncher, setOpen]);

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
