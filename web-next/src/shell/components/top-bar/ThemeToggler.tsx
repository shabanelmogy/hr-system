import { IconButton } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { useTranslation } from "react-i18next";

const ThemeToggler = ({ currentMode, onToggle }: { currentMode: string; onToggle: () => void }) => {
  const { t } = useTranslation();
  const targetModeLabel = t(currentMode === "light" ? "general.darkMode" : "general.lightMode");

  return (
    <IconButton onClick={onToggle} color="inherit" aria-label={targetModeLabel}>
      {currentMode === "light" ? (
        <LightModeOutlinedIcon />
      ) : (
        <DarkModeOutlinedIcon />
      )}
    </IconButton>
  );
};

export default ThemeToggler;
