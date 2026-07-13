import { Outlet } from "react-router-dom";
import { Container, Box } from "@mui/material";
import { useThemeSettings } from "../../theme/useThemeSettings";
import { ThemeProvider } from "@mui/material/styles";
import { CacheProvider } from "@emotion/react";
import CssBaseline from "@mui/material/CssBaseline";
import TopBar from "../components/topBar/topBar";

const AuthLayout = () => {
  const { setMode, toggleDirection, theme, cacheProvider, direction } =
    useThemeSettings();

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={cacheProvider}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            p: 3,
            backgroundImage: "url('/images/background-dark.png')", // Subtle pattern
          }}
        >
          <CssBaseline />
          <Container maxWidth="md">
            <TopBar
              open={false}
              handleDrawerOpen={() => {}}
              isAuthenticated={false}
              setMode={setMode}
              direction={direction}
              toggleDirection={toggleDirection}
            />
            <Outlet />
          </Container>
        </Box>
      </CacheProvider>
    </ThemeProvider>
  );
};

export default AuthLayout;
