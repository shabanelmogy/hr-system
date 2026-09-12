import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LanguageIcon from "@mui/icons-material/Language";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { List, ListItemIcon, ListItemText, Menu } from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { languageLabels } from "@/locales/languages";
import { StyledListItem } from "./TopBarStyles";

type AuthMobileMenuProps = {
  anchorEl: HTMLElement | null;
  open: boolean;
  onClose: () => void;
  onThemeToggle: () => void;
  onLanguageToggle: () => void;
  theme: Theme;
  direction: "ltr" | "rtl";
};

export default function AuthMobileMenu({
  anchorEl,
  open,
  onClose,
  onThemeToggle,
  onLanguageToggle,
  theme,
  direction,
}: AuthMobileMenuProps) {
  const { t } = useTranslation();

  return (
    <Menu
      id="auth-mobile-menu"
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "top",
        horizontal: direction === "rtl" ? "left" : "right",
      }}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: direction === "rtl" ? "left" : "right",
      }}
      open={open}
      onClose={onClose}
      disableScrollLock
      slotProps={{
        paper: {
          dir: direction,
          sx: { maxHeight: "65vh", width: 200 },
        },
      }}
    >
      <List component="nav" dense dir={direction} sx={{ p: 0 }}>
        <StyledListItem onClick={onThemeToggle}>
          <ListItemIcon>
            {theme.palette.mode === "light" ? (
              <LightModeOutlinedIcon color="primary" />
            ) : (
              <DarkModeOutlinedIcon color="primary" />
            )}
          </ListItemIcon>
          <ListItemText
            primary={theme.palette.mode === "light" ? t("darkMode") : t("lightMode")}
          />
        </StyledListItem>

        <StyledListItem onClick={onLanguageToggle}>
          <ListItemIcon>
            <LanguageIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={direction === "ltr" ? languageLabels.ar : languageLabels.en}
          />
        </StyledListItem>
      </List>
    </Menu>
  );
}
