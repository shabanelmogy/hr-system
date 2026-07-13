import { useState } from "react";
import { IconButton } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api/client";

// Import sub-components
import SettingsMenu from "./SettingsMenu";

const SettingsSystem = () => {
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();

  const handleSettingsMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsMenuClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleLogout = () => {
    handleSettingsMenuClose();
    void apiClient.logout();
  };

  const navigateToProfile = () => {
    router.push("/profile");
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
