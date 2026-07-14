import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import * as React from "react";

import useTokenRevocation from "../../shared/store/useTokenRevocation";
import SideBar from "../components/sidebar/SideBar";
import SidebarContext from "@/shared/contexts/SidebarContext";
import TopBar from "../components/top-bar/TopBar";
import ToolbarSpacer from "../components/top-bar/ToolbarSpacer";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const handleDrawerOpen = () => setOpen(true);
  const handleDrawerClose = () => setOpen(false);

  useTokenRevocation();

  return (
    <SidebarContext.Provider value={{ open, setOpen }}>
      <Box
        dir="ltr"
        sx={{
          display: "flex",
          flexDirection: theme.direction === "rtl" ? "row-reverse" : "row",
          width: "100%",
          minHeight: "100vh",
          overflow: "hidden",
          bgcolor: "background.default",
        }}
      >
        <TopBar open={open} handleDrawerOpen={handleDrawerOpen} />

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
    </SidebarContext.Provider>
  );
};

export default MainLayout;
