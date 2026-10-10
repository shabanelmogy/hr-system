import { Box, IconButton, Tooltip, Typography, alpha } from "@mui/material";
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/SessionContext";

// Import sub-components
import LanguageSelector from "./LanguageSelector";
import MobileMenu from "./MobileMenu";
import SettingsSystem from "./SettingsSystem";
import ThemeToggler from "./ThemeToggler";

// Import styled components
import { AppBar, StyledToolbar } from "./TopBarStyles";
import UserWelcome from "./UserWelcome";
import { useTopBarPreferences } from "./useTopBarPreferences";
import { CompanyContextSwitcher, TenantNameBadge } from "@/platform/tenant-access";
import { ModuleContextSwitcher } from "@/platform/modules";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";
import { useAuthorizedNavigation } from "@/shell/navigation/useAuthorizedNavigation";
import { appRoutes } from "@/config/routes";

const DisplayDebugger = dynamic(() => import("./DisplayDebugger"), { ssr: false });
const GlobalSearchButton = dynamic(
  () =>
    import("@/platform/global-search").then(
      (module) => module.GlobalSearchButton,
    ),
  { ssr: false, loading: TopBarActionPlaceholder },
);
const NotificationBell = dynamic(
  () =>
    import("@/platform/notifications").then(
      (module) => module.NotificationBell,
    ),
  { ssr: false, loading: TopBarActionPlaceholder },
);

function TopBarActionPlaceholder() {
  return <Box aria-hidden sx={{ width: 40, height: 40, flexShrink: 0 }} />;
}

const TopBar = ({
  open,
  handleDrawerToggle,
  onHeightChange,
  showSidebarToggle = true,
  contextActions,
  compactContextActions,
}: {
  open: boolean;
  handleDrawerToggle: () => void;
  onHeightChange: (height: number) => void;
  showSidebarToggle?: boolean;
  contextActions?: ReactNode;
  compactContextActions?: ReactNode;
}) => {
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  useLayoutEffect(() => {
    const toolbar = toolbarRef.current;
    if (!toolbar) return;
    const update = () => onHeightChange(Math.ceil(toolbar.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(toolbar);
    return () => observer.disconnect();
  }, [onHeightChange]);
  const { theme, t, direction, changeLanguage, toggleTheme } = useTopBarPreferences();
  const { user, logout: sessionLogout } = useSession();
  const { requestDiscard } = useUnsavedChanges();
  const isAuthenticated = user !== null;
  const isSuperAdmin = user?.roles.some(
    (role) => role.trim().toLowerCase() === "super_admin",
  );
  const { navigation: searchNavigation } = useAuthorizedNavigation();

  const router = useRouter();

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleLanguageChange = (value: string) => {
    changeLanguage(value);
    handleMobileMenuClose();
  };

  const handleThemeToggle = () => {
    toggleTheme();
    handleMobileMenuClose();
  };

  const handleLogout = async () => {
    if (!(await requestDiscard())) return;
    handleMobileMenuClose();
    void sessionLogout();
  };

  const navigateToProfile = async () => {
    if (!(await requestDiscard())) return;
    router.push(appRoutes.platform.profile);
    handleMobileMenuClose();
  };

  return (
    <>
      <AppBar position="fixed" open={open} dir={direction} sx={{ containerType: "inline-size", containerName: "app-toolbar" }}>
        <StyledToolbar
          ref={toolbarRef}
          open={open}
          dir={direction}
          sx={{ minWidth: 0, gap: 0.5, flexWrap: "nowrap", overflow: "hidden" }}
        >
          {/* Left Section */}
          <Box sx={{ display: "flex", alignItems: "center", flex: "0 1 auto", minWidth: 0 }}>
            {isAuthenticated && showSidebarToggle && (
              <Tooltip
                title={t(open ? "menu.closeSidebar" : "menu.openSidebar")}
              >
                <IconButton
                  color="inherit"
                  aria-label={t(open ? "menu.closeSidebar" : "menu.openSidebar")}
                  aria-controls="app-sidebar"
                  aria-expanded={open}
                  onClick={handleDrawerToggle}
                  sx={{
                    width: 40,
                    height: 40,
                    flexShrink: 0,
                    marginInlineEnd: { xs: 1, md: 2 },
                    borderRadius: 1,
                    backgroundColor: open
                      ? alpha(theme.palette.common.white, 0.14)
                      : "transparent",
                    transition: theme.transitions.create(
                      ["background-color", "transform"],
                      { duration: theme.transitions.duration.shortest },
                    ),
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.common.white, 0.2),
                    },
                  }}
                >
                  {open ? (
                    <MenuOpenRoundedIcon
                      sx={{
                        transform: direction === "rtl" ? "scaleX(-1)" : "none",
                      }}
                    />
                  ) : (
                    <MenuRoundedIcon />
                  )}
                </IconButton>
              </Tooltip>
            )}
            <Link
              href={appRoutes.shell.home}
              aria-label={t("general.mainTitle")}
              style={{
                display: "flex",
                minWidth: 0,
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Diversity3Icon sx={{ flexShrink: 0, marginInlineEnd: { xs: 1, sm: 2 } }} />
              <Typography
                variant="body1"
                sx={{
                  fontWeight: "bold",
                  fontSize: { xs: 14, sm: 16 },
                  lineHeight: 1.3,
                  minWidth: 0,
                  overflowWrap: "anywhere",
                  "@container app-toolbar (max-width: 599px)": {
                    display: "none",
                  },
                }}
                color={theme.palette.mode === "light" ? theme.palette.primary.contrastText : theme.palette.primary.main}
                suppressHydrationWarning
              >
                {t("general.mainTitle")}
              </Typography>
            </Link>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Context participates in flex layout; it never overlaps toolbar actions. */}
          {isAuthenticated && (
            <Box
              sx={{
                display: "none",
                "@container app-toolbar (min-width: 1200px)": { display: "flex" },
                alignItems: "center",
                gap: 1,
                flex: "0 1 auto",
                maxWidth: "min(560px, 45%)",
                minWidth: 0,
                overflow: "visible",
                whiteSpace: "nowrap",
              }}
            >
              <ModuleContextSwitcher iconOnly />
              <Box
                role="group"
                aria-label={t("auth.currentContext")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flex: "1 1 auto",
                  minWidth: 0,
                  overflow: "hidden",
                  p: 0.25,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.52 : 0.82),
                  border: `1px solid ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.1 : 0.28)}`,
                  boxShadow: `0 2px 8px ${alpha(theme.palette.common.black, 0.08)}`,
                  "& .ContextBadge-root": {
                    bgcolor: "transparent",
                    border: 0,
                    borderRadius: 1.5,
                  },
                  "& .ContextBadge-root:hover": {
                    bgcolor: alpha(theme.palette.primary.main, 0.09),
                  },
                  "& .ContextBadge-root + .ContextBadge-root": {
                    borderInlineStart: `1px solid ${theme.palette.divider}`,
                    borderStartStartRadius: 0,
                    borderEndStartRadius: 0,
                  },
                }}
              >
                <TenantNameBadge />
                <CompanyContextSwitcher />
                {contextActions}
              </Box>
              <UserWelcome isMobile />
            </Box>
          )}

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* Desktop Right Section */}
          <Box
            sx={{
              alignItems: "center",
              position: "relative",
              right: 0,
              display: "none", "@container app-toolbar (min-width: 1000px)": { display: "flex" },
            }}
          >
            <LanguageSelector
              direction={direction}
              handleLanguageChange={handleLanguageChange}
            />

            <Box sx={{ display: "flex", mx: 1 }}>
              <ThemeToggler
                currentMode={theme.palette.mode}
                onToggle={handleThemeToggle}
              />
            </Box>
          </Box>

          {/* Compact context controls on screens where the centered group would be too narrow */}
          {isAuthenticated && (
            <Box
              sx={{
                display: "flex", "@container app-toolbar (min-width: 1200px)": { display: "none" },
                alignItems: "center",
                gap: 0.5,
                marginInlineEnd: 1,
                minWidth: 0,
              }}
            >
              <ModuleContextSwitcher iconOnly />
              <Box
                role="group"
                aria-label={t("auth.currentContext")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.25,
                  p: 0.25,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.common.white, 0.1),
                  border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                  "& .ContextBadge-root": {
                    bgcolor: "transparent",
                    border: 0,
                    color: "inherit",
                  },
                  "& .ContextBadge-icon": {
                    bgcolor: alpha(theme.palette.background.paper, 0.92),
                  },
                  "& .ContextBadge-expand": {
                    color: "inherit",
                  },
                  "& .ContextBadge-root:hover": {
                    bgcolor: alpha(theme.palette.common.white, 0.12),
                  },
                }}
              >
                <TenantNameBadge compact iconOnly />
                <CompanyContextSwitcher compact iconOnly />
                {compactContextActions}
              </Box>
              <Box sx={{ display: "none", "@container app-toolbar (min-width: 760px)": { display: "flex" }, flexShrink: 0 }}>
                <UserWelcome isMobile={true} />
              </Box>
            </Box>
          )}

          {isAuthenticated && <GlobalSearchButton navigation={searchNavigation} />}

          {isAuthenticated && !isSuperAdmin && <NotificationBell />}

          {process.env.NODE_ENV === "development" && <DisplayDebugger />}

          {isAuthenticated && (
            <Box sx={{ display: "none", "@container app-toolbar (min-width: 1200px)": { display: "flex" } }}>
              <SettingsSystem />
            </Box>
          )}

          {/* Mobile More Button */}
          <Box sx={{ display: "flex", "@container app-toolbar (min-width: 1200px)": { display: "none" } }}>
            <IconButton
              size="large"
              aria-label={t("files.more")}
              aria-controls="mobile-menu"
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreVertIcon />
            </IconButton>
          </Box>

          {/* Mobile Menu */}
          <MobileMenu
            anchorEl={mobileMoreAnchorEl}
            open={Boolean(mobileMoreAnchorEl)}
            onClose={handleMobileMenuClose}
            theme={theme}
            handleThemeToggle={handleThemeToggle}
            direction={direction}
            toggleLanguage={() =>
              handleLanguageChange(direction === "ltr" ? "rtl" : "ltr")
            }
            isAuthenticated={isAuthenticated}
            navigateToProfile={navigateToProfile}
            handleLogout={handleLogout}
          />
        </StyledToolbar>

      </AppBar>

    </>
  );
};

export default TopBar;
