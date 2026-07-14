import { useState } from "react";
import { alpha, IconButton, Tooltip } from "@mui/material";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/api/client";
import { useTheme } from "@mui/material/styles";

// Import sub-components
import SettingsMenu from "./SettingsMenu";

const SettingsSystem = () => {
  const [settingsAnchorEl, setSettingsAnchorEl] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const theme = useTheme();
  const { t } = useTranslation();
  const settingsOpen = Boolean(settingsAnchorEl);

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
      <Tooltip title={t("menu.settings")} arrow>
        <IconButton
          color="inherit"
          aria-label={t("menu.settings")}
          aria-haspopup="menu"
          aria-expanded={settingsOpen ? "true" : undefined}
          onClick={handleSettingsMenu}
          sx={{
            width: 40,
            height: 40,
            borderRadius: 1.5,
            color: settingsOpen
              ? theme.palette.primary.main
              : theme.palette.common.white,
            backgroundColor: settingsOpen
              ? alpha(theme.palette.primary.main, 0.16)
              : "transparent",
            transition: theme.transitions.create(
              ["background-color", "color", "transform"],
              { duration: theme.transitions.duration.shortest },
            ),
            "&:hover": {
              color: theme.palette.primary.light,
              backgroundColor: alpha(theme.palette.primary.main, 0.2),
              transform: "translateY(-1px)",
            },
          }}
        >
          <SettingsOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>

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
