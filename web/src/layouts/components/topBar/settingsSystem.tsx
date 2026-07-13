import { useState } from "react";
import { IconButton } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useNavigate } from "react-router-dom";

// Import sub-components
import SettingsMenu from "./settingsMenu";

const SettingsSystem = () => {
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const navigate = useNavigate();

  const handleSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login", { replace: true });
    handleSettingsMenuClose();
  };

  const navigateToProfile = () => {
    navigate("/profilePage");
    handleSettingsMenuClose();
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleSettingsMenu}>
        <SettingsOutlinedIcon />
      </IconButton>

      <SettingsMenu
        anchorEl={settingsAnchorEl}
        open={Boolean(settingsAnchorEl)}
        onClose={handleSettingsMenuClose}
        navigateToProfile={navigateToProfile}
        handleLogout={handleLogout}
      />
    </>
  );
};

export default SettingsSystem;
