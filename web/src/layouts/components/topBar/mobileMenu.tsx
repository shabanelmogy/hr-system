/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  Menu,
  List,
  ListItemIcon,
  ListItemText,
  Collapse,
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person2";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTranslation } from "react-i18next";
import { StyledListItem } from "./topBarStyles";

import { languages } from "../../../constants/strings";

const MobileMenu = ({
  anchorEl,
  open,
  onClose,
  handleThemeToggle,
  theme,
  direction,
  toggleLanguage,
  navigateToProfile,
  handleLogout,
  isAuthenticated,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  handleThemeToggle: () => void;
  theme: any;
  direction: string;
  toggleLanguage: () => void;
  navigateToProfile: () => void;
  handleLogout: () => void;
  isAuthenticated: boolean;
}) => {
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { t } = useTranslation();

  const toggleAccountMenu = () => {
    setAccountMenuOpen(!accountMenuOpen);
  };

  return (
    <Menu
      id="mobile-menu"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={open}
      onClose={onClose}
      disableScrollLock
      slotProps={{
        paper: {
          style: {
            maxHeight: "65vh",
            width: "200px",
          },
        },
      }}
    >
      <List component="nav" dense sx={{ p: 0 }}>
        {/* Theme Toggle Button */}
        <StyledListItem onClick={handleThemeToggle}>
          <ListItemIcon>
            {theme.palette.mode === "light" ? (
              <LightModeOutlinedIcon color="primary" />
            ) : (
              <DarkModeOutlinedIcon color="primary" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={
              theme.palette.mode === "light" ? t("darkMode") : t("lightMode")
            }
          />
        </StyledListItem>

        {/* Language Toggle Button */}
        <StyledListItem onClick={toggleLanguage}>
          <ListItemIcon>
            <LanguageIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={direction === "LTR" ? languages.ar : languages.en}
          />
        </StyledListItem>

        {/* Account Submenu (Only if authenticated) */}
        {isAuthenticated && (
          <>
            <StyledListItem onClick={toggleAccountMenu}>
              <ListItemIcon>
                <AccountCircleIcon color="primary" />
              </ListItemIcon>
              <ListItemText primary={t("account")} />
              {accountMenuOpen ? <ExpandLess /> : <ExpandMore />}
            </StyledListItem>
            <Collapse in={accountMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <StyledListItem sx={{ pl: 4 }} onClick={navigateToProfile}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={t("profile")} />
                </StyledListItem>

                <StyledListItem sx={{ pl: 4 }} onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText primary={t("logout")} />
                </StyledListItem>
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Menu>
  );
};

export default MobileMenu;
