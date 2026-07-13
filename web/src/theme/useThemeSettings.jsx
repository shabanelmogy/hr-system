import createCache from "@emotion/cache";
import { createTheme } from "@mui/material/styles";
import * as React from "react";
import { prefixer } from "stylis";
import rtlPlugin from "stylis-plugin-rtl";
import "../locales/i18n"; // Import your i18n configuration
import { getDesignTokens } from "./theme"; // Ensure correct import

// Create caches for RTL & LTR
const rtlCache = createCache({
  key: "muirtl",
  stylisPlugins: [prefixer, rtlPlugin],
});
const ltrCache = createCache({ key: "muiltr" });

// Function to get browser theme preference
const getBrowserTheme = () =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

// Function to detect browser direction
const getBrowserDirection = () => {
  const rtlLangs = ["ar", "fa", "he", "ur"];
  return rtlLangs.some((lang) => navigator.language.startsWith(lang))
    ? "rtl"
    : "ltr";
};

export const useThemeSettings = () => {
  const savedDirection =
    localStorage.getItem("direction") || getBrowserDirection();
  const currentMode = localStorage.getItem("currentMode") || "dark";
  const [mode, setMode] = React.useState(currentMode);
  const [direction, setDirection] = React.useState(savedDirection);

  React.useEffect(() => {
    document.body.dir = direction;
  }, [direction]);

  const toggleDirection = React.useCallback(() => {
    const newDirection = direction === "ltr" ? "rtl" : "ltr";
    setDirection(newDirection);
    document.body.dir = newDirection;
    localStorage.setItem("direction", newDirection);
  }, [direction]);

  const theme = React.useMemo(
    () => createTheme(getDesignTokens(mode, direction)),
    [mode, direction]
  );

  return {
    mode,
    setMode,
    direction,
    toggleDirection, // Ensure this is returned
    theme,
    cacheProvider: direction === "rtl" ? rtlCache : ltrCache,
  };
};
