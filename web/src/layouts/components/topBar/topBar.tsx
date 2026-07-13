/* eslint-disable react/prop-types */
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { useState } from "react";

import Diversity3Icon from "@mui/icons-material/Diversity3";
import MenuIcon from "@mui/icons-material/Menu";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import i18n from "i18next";
import cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

// Import sub-components
import LanguageSelector from "./languageSelector";
import MobileMenu from "./mobileMenu";
import NotificationsSystem from "./notificationMenu/SimpleNotificationsSystem";
import SettingsSystem from "./settingsSystem";
import ThemeToggler from "./themeToggler";

// Import styled components
import { AppBar, StyledToolbar } from "./topBarStyles";
import UserWelcome from "./userWelcome";

// ToastContainer removed - using simplified notification system

const TopBar = ({
  open,
  handleDrawerOpen,
  setMode,
  toggleDirection,
  direction,
  isAuthenticated,
}: {
  open: boolean;
  handleDrawerOpen: () => void;
  setMode: (mode: any) => void;
  toggleDirection: (direction: string) => void;
  direction: string;
  isAuthenticated: boolean;
}) => {
  const theme = useTheme();
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = useState<HTMLElement | null>(null);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleLanguageChange = (value: string) => {
    document.documentElement.setAttribute("dir", value);
    i18n.changeLanguage(value === "ltr" ? "en" : "ar");
    cookies.set("i18next", value === "ltr" ? "en" : "ar");
    toggleDirection(value);
    handleMobileMenuClose();
  };

  const handleThemeToggle = () => {
    const newMode = theme.palette.mode === "dark" ? "light" : "dark";

    // Save to localStorage
    localStorage.setItem("currentMode", newMode);

    // Toggle body class
    document.body.classList.remove("dark", "light");
    document.body.classList.add(newMode);

    // Update theme state
    setMode((prevMode: string) => (prevMode === "light" ? "dark" : "light"));

    // Close mobile menu if open
    handleMobileMenuClose();
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
    handleMobileMenuClose();
  };

  const navigateToProfile = () => {
    navigate("/profilePage");
    handleMobileMenuClose();
  };

  return (
    <>
      {/* @ts-ignore */}
      <AppBar position="fixed" open={open}>
        {/* @ts-ignore */}
        <StyledToolbar open={open}>
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
                sx={[{ marginRight: 5 }, open && { display: "none" }]}
              >
                <MenuIcon />
              </IconButton>
            )}
            <Link
              to="/"
              style={{
                display: "flex",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Diversity3Icon sx={{ mr: 2 }} />
              <Typography
                variant="body1"
                sx={{ fontWeight: "bold" }}
                color={theme.palette.mode === "light" ? "white" : theme.palette.primary.main}
              >
                {t("general.mainTitle")}
              </Typography>
            </Link>
          </Box>

          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />

          {/* User Welcome - Desktop */}
          {isAuthenticated && (
            <Box sx={{ display: { xs: "none", md: "flex" }, mr: 2 }}>
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
              {isAuthenticated && <NotificationsSystem />}
              {isAuthenticated && <SettingsSystem />}

              {isAuthenticated && <Box sx={{ display: "flex" }}></Box>}
            </Box>
          </Box>

          {/* Mobile User Welcome */}
          {isAuthenticated && (
            <Box sx={{ display: { xs: "flex", md: "none" }, mr: 1 }}>
              <UserWelcome isMobile={true} />
            </Box>
          )}

          {/* Mobile More Button */}
          <Box sx={{ display: { xs: "flex", md: "none" } }}>
            {isAuthenticated && (
              <Box sx={{ display: "flex" }}>
                <NotificationsSystem />
              </Box>
            )}

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