/* eslint-disable react/prop-types */
import { IconButton } from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";

const ThemeToggler = ({ currentMode, onToggle }: { currentMode: string; onToggle: () => void }) => {
  return (
    <IconButton onClick={onToggle} color="inherit">
      {currentMode === "light" ? (
        <LightModeOutlinedIcon />
      ) : (
        <DarkModeOutlinedIcon />
      )}
    </IconButton>
  );
};

export default ThemeToggler;
