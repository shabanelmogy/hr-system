import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import {
  Box,
  CircularProgress,
  Fade,
  Stack,
  Typography,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { useSession } from "@/lib/auth/SessionContext";
import { useTokenRevocation } from "@/features/auth";
import SideBar from "../components/sidebar/SideBar";
import SidebarContext from "@/shared/contexts/SidebarContext";
import TopBar from "../components/top-bar/TopBar";
import ToolbarSpacer from "../components/top-bar/ToolbarSpacer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const { t } = useTranslation();
  const { isLoggingOut } = useSession();
  const [open, setOpen] = React.useState(false);

  const handleDrawerClose = () => setOpen(false);
  const handleDrawerToggle = () => setOpen((current) => !current);

  useTokenRevocation();

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <Box
        dir="ltr"
        aria-hidden={isLoggingOut}
        sx={{
          display: "flex",
          flexDirection: theme.direction === "rtl" ? "row-reverse" : "row",
          width: "100%",
          minHeight: "100vh",
          overflow: "hidden",
          bgcolor: "background.default",
          opacity: isLoggingOut ? 0 : 1,
          pointerEvents: isLoggingOut ? "none" : "auto",
          transition: theme.transitions.create("opacity", {
            duration: theme.transitions.duration.leavingScreen,
          }),
          "@media (prefers-reduced-motion: reduce)": {
            transition: "none",
          },
        }}
      >
        <TopBar open={open} handleDrawerToggle={handleDrawerToggle} />

        <SideBar open={open} handleDrawerClose={handleDrawerClose} />

        <Box
          component="main"
          dir={theme.direction}
          sx={{
            flexGrow: 1,
            minWidth: 0,
            m: 3,
          }}
        >
          <ToolbarSpacer />
          {children}
        </Box>
      </Box>

      <Fade
        in={isLoggingOut}
        timeout={theme.transitions.duration.shortest}
        unmountOnExit
      >
        <Box
          role="status"
          aria-live="polite"
          dir={theme.direction}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: theme.zIndex.modal + 1,
            display: "grid",
            placeItems: "center",
            px: 3,
            color: "text.primary",
            backgroundColor: alpha(theme.palette.background.default, 0.92),
            backdropFilter: "blur(4px)",
          }}
        >
          <Stack spacing={1.5} sx={{ alignItems: "center", textAlign: "center" }}>
            <Box
              sx={{
                position: "relative",
                display: "grid",
                width: 56,
                height: 56,
                placeItems: "center",
              }}
            >
              <CircularProgress size={56} thickness={2.5} />
              <LogoutRoundedIcon
                color="primary"
                sx={{ position: "absolute", fontSize: 24 }}
              />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {t("auth.signingOut")}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t("auth.signingOutDescription")}
            </Typography>
          </Stack>
        </Box>
      </Fade>
    </SidebarContext.Provider>
  );
};

export default MainLayout;
