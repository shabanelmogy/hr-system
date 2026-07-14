import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useState } from "react";

import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth/SessionContext";
import { useThemeSettingsContext } from "@/theme/ThemeShell";
import { NotificationBell } from "@/shared/notifications";

// Import sub-components
import LanguageSelector from "./LanguageSelector";
import MobileMenu from "./MobileMenu";
import SettingsSystem from "./SettingsSystem";
import ThemeToggler from "./ThemeToggler";
import DisplayDebugger from "./DisplayDebugger";

// Import styled components
import { AppBar, StyledToolbar } from "./TopBarStyles";
import UserWelcome from "./UserWelcome";

const TopBar = ({
  open,
  handleDrawerOpen,
}: {
  open: boolean;
  handleDrawerOpen: () => void;
}) => {
  const theme = useTheme();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null);
  const { t, i18n } = useTranslation();
  const { direction, setMode } = useThemeSettingsContext();
  const { user, logout: sessionLogout } = useSession();
  const isAuthenticated = user !== null;

  const router = useRouter();

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleLanguageChange = (value: string) => {
    const language = value === "ltr" ? "en" : "ar";
    cookies.set("i18next", language, { expires: 365, sameSite: "lax" });
    void i18n.changeLanguage(language);
    handleMobileMenuClose();
  };

  const handleThemeToggle = () => {
    const newMode = theme.palette.mode === "dark" ? "light" : "dark";

    localStorage.setItem("currentMode", newMode);
    cookies.set("currentMode", newMode, { expires: 365, sameSite: "lax" });
    setMode(newMode);

    handleMobileMenuClose();
  };

  const handleLogout = () => {
    handleMobileMenuClose();
    void sessionLogout();
  };

  const navigateToProfile = () => {
    router.push("/profile");
    handleMobileMenuClose();
  };

  return (
    <>
      <AppBar position="fixed" open={open} dir={direction}>
        <StyledToolbar open={open} dir={direction}>
          {/* Left Section */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            {isAuthenticated && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={(e) => {
                  handleDrawerOpen();
                  e.currentTarget.blur();
                }}
                edge="start"
                sx={[{ marginInlineEnd: 5 }, open && { display: "none" }]}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Link
              href="/"
              style={{
                display: "flex",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Diversity3Icon sx={{ marginInlineEnd: 2 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold" }}
                color={theme.palette.mode === "light" ? "white" : theme.palette.primary.main}
                suppressHydrationWarning
              >
                {t("general.mainTitle")}
              </Typography>
            </Link>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* User Welcome - Desktop */}
          {isAuthenticated && (
            <Box sx={{ display: { xs: "none", md: "flex" }, marginInlineEnd: 2 }}>
              <UserWelcome />
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
              display: { xs: "none", md: "flex" },
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

          {/* Mobile User Welcome */}
          {isAuthenticated && (
            <Box sx={{ display: { xs: "flex", md: "none" }, marginInlineEnd: 1 }}>
              <UserWelcome isMobile={true} />
            </Box>
          )}

          {isAuthenticated && <NotificationBell />}

          {process.env.NODE_ENV === "development" && <DisplayDebugger />}

          {isAuthenticated && (
            <Box sx={{ display: { xs: "none", md: "flex" } }}>
              <SettingsSystem />
            </Box>
          )}

          {/* Mobile More Button */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="show more"
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
