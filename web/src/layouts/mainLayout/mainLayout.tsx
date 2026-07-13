// MainLayout.js
import { CacheProvider } from "@emotion/react";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import { styled, ThemeProvider } from "@mui/material/styles";
import * as React from "react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

import { ToastProvider } from "../../shared/components/common/feedback/Toast";
import apiService from "../../shared/services/apiService";
import useTokenRevocation from "../../shared/store/useTokenRevocation";
import { useThemeSettings } from "../../theme/useThemeSettings";
import SideBar from "../components/sidebar/sideBar";
import SidebarContext from "../components/sidebar/sidebarContext"; // Import context
import TopBar from "../components/topBar/topBar";
// NotificationProvider removed - using simplified notification system

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

const MainLayout = () => {
  const { setMode, toggleDirection, theme, cacheProvider, direction } =
    useThemeSettings();
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const handleSetOpen = () => setOpen(true);
  const handleSetClosed = () => setOpen(false);

  useEffect(() => {
    apiService.setNavigateFunction(navigate);
  }, [navigate]);

  useEffect(() => {
    // Set initial body class based on current theme
    document.body.classList.remove("dark", "light");
    document.body.classList.add(theme.palette.mode);
  }, [theme.palette.mode]);

  useTokenRevocation();

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={cacheProvider}>
       
          <SidebarContext.Provider value={{ open, setOpen: handleSetOpen }}>
            <Box sx={{ display: "flex", width: "100%", overflow: "hidden" }}>
              <CssBaseline />

              <TopBar
                open={open}
                handleDrawerOpen={handleSetOpen}
                setMode={setMode}
                direction={direction}
                toggleDirection={toggleDirection}
                isAuthenticated={true}
              />

              <SideBar open={open} handleDrawerClose={handleSetClosed} />

              <Box component="main" sx={{ flexGrow: 1, m: 3 }}>
                <DrawerHeader />
                <Outlet />
              </Box>
            </Box>
            
            {/* Global persistent audio player */}
   
          </SidebarContext.Provider>
          <ToastProvider position="top-right" children={""} />        
      </CacheProvider>
    </ThemeProvider>
  );
};

export default MainLayout;
