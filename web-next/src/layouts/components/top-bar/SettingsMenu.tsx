/* eslint-disable react/prop-types */
import { Menu, MenuItem } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person2";
import LogoutIcon from "@mui/icons-material/Logout";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";

const SettingsMenu = ({
  anchorEl,
  open,
  onClose,
  navigateToProfile,
  handleLogout,
}: {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  navigateToProfile: () => void;
  handleLogout: () => void;
}) => {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <Menu
      id="menu-appbar"
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      keepMounted
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      open={open}
      onClose={onClose}
      disableScrollLock
    >
      <MenuItem onClick={navigateToProfile}>
        <PersonIcon sx={{ mr: 1, color: theme.palette.primary.main }} />
        {t("profile")}
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <LogoutIcon sx={{ mr: 1, color: theme.palette.error.main }} />
        {t("logout")}
      </MenuItem>
    </Menu>
  );
};

export default SettingsMenu;
