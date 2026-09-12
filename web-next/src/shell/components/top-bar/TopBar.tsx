import { Box, IconButton, Tooltip, Typography, alpha } from "@mui/material";
import { useLayoutEffect, useRef, useState } from "react";
import { useMemo } from "react";

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
import { getNavigationConfig } from "../sidebar/navigationConfig";
import { useTopBarPreferences } from "./useTopBarPreferences";
import { CompanyContextSwitcher } from "@/platform/tenant-access";
import { ModuleContextSwitcher } from "@/platform/modules";
import { useUnsavedChanges } from "@/shared/contexts/UnsavedChangesContext";

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
}: {
  open: boolean;
  handleDrawerToggle: () => void;
  onHeightChange: (height: number) => void;
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
  const searchNavigation = useMemo(
    () => getNavigationConfig(user?.roles, user?.permissions),
    [user?.permissions, user?.roles],
  );

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
    router.push("/profile");
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
            {isAuthenticated && (
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
              href="/"
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
                color={theme.palette.mode === "light" ? "white" : theme.palette.primary.main}
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
                overflow: "hidden",
                whiteSpace: "nowrap",
              }}
            >
              <ModuleContextSwitcher />
              <UserWelcome />
              <CompanyContextSwitcher />
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
              <Box sx={{ display: "none", "@container app-toolbar (min-width: 760px)": { display: "flex" }, flexShrink: 0 }}>
                <UserWelcome isMobile={true} />
              </Box>
              <CompanyContextSwitcher compact />
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
