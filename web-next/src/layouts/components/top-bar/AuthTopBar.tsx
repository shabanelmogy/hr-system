"use client";

import Diversity3Icon from "@mui/icons-material/Diversity3";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { Box, IconButton, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState, type MouseEvent } from "react";
import AuthMobileMenu from "./AuthMobileMenu";
import LanguageSelector from "./LanguageSelector";
import ThemeToggler from "./ThemeToggler";
import { AppBar, StyledToolbar } from "./TopBarStyles";
import { useTopBarPreferences } from "./useTopBarPreferences";

const DisplayDebugger = dynamic(() => import("./DisplayDebugger"), { ssr: false });

export default function AuthTopBar() {
  const [mobileAnchor, setMobileAnchor] = useState<HTMLElement | null>(null);
  const {
    theme,
    t,
    direction,
    changeLanguage,
    toggleTheme,
  } = useTopBarPreferences();

  const closeMobileMenu = () => setMobileAnchor(null);
  const changeLanguageAndClose = (value: string) => {
    changeLanguage(value);
    closeMobileMenu();
  };
  const toggleThemeAndClose = () => {
    toggleTheme();
    closeMobileMenu();
  };

  return (
    <AppBar position="fixed" open={false} dir={direction}>
      <StyledToolbar open={false} dir={direction}>
        <Link
          href="/"
          style={{ display: "flex", alignItems: "center", textDecoration: "none", color: "inherit" }}
        >
          <Diversity3Icon sx={{ marginInlineEnd: 2 }} />
          <Typography
            variant="body1"
            sx={{ fontWeight: "bold" }}
            color={theme.palette.mode === "light" ? "white" : theme.palette.primary.main}
            suppressHydrationWarning
          >
            {t("general.mainTitle")}
          </Typography>
        </Link>

        <Box sx={{ flexGrow: 1 }} />

        <Box sx={{ alignItems: "center", display: { xs: "none", md: "flex" } }}>
          <LanguageSelector
            direction={direction}
            handleLanguageChange={changeLanguageAndClose}
          />
          <Box sx={{ display: "flex", mx: 1 }}>
            <ThemeToggler
              currentMode={theme.palette.mode}
              onToggle={toggleThemeAndClose}
            />
          </Box>
        </Box>

        {process.env.NODE_ENV === "development" && <DisplayDebugger />}

        <Box sx={{ display: { xs: "flex", md: "none" } }}>
          <IconButton
            size="large"
            aria-label="show more"
            aria-controls="auth-mobile-menu"
            aria-haspopup="true"
            onClick={(event: MouseEvent<HTMLElement>) => setMobileAnchor(event.currentTarget)}
            color="inherit"
          >
            <MoreVertIcon />
          </IconButton>
        </Box>

        <AuthMobileMenu
          anchorEl={mobileAnchor}
          open={Boolean(mobileAnchor)}
          onClose={closeMobileMenu}
          theme={theme}
          direction={direction}
          onThemeToggle={toggleThemeAndClose}
          onLanguageToggle={() => changeLanguageAndClose(direction === "ltr" ? "rtl" : "ltr")}
        />
      </StyledToolbar>
    </AppBar>
  );
}
