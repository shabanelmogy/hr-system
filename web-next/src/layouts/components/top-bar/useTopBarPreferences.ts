import cookies from "js-cookie";
import { useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useThemeSettingsContext } from "@/theme/ThemeShell";

export function useTopBarPreferences() {
  const theme = useTheme();
  const { t, i18n } = useTranslation();
  const { direction, setMode } = useThemeSettingsContext();

  const changeLanguage = (value: string) => {
    const language = value === "ltr" ? "en" : "ar";
    cookies.set("i18next", language, { expires: 365, sameSite: "lax" });
    void i18n.changeLanguage(language);
  };

  const toggleTheme = () => {
    const newMode = theme.palette.mode === "dark" ? "light" : "dark";
    localStorage.setItem("currentMode", newMode);
    cookies.set("currentMode", newMode, { expires: 365, sameSite: "lax" });
    setMode(newMode);
  };

  return {
    theme,
    t,
    direction,
    changeLanguage,
    toggleTheme,
  };
}
