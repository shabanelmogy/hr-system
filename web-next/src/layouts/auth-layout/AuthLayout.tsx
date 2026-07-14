import { Container, Box, useTheme } from "@mui/material";
import TopBar from "../components/top-bar/TopBar";
import type { ReactNode } from "react";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        p: 3,
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Container maxWidth="md">
        <TopBar open={false} handleDrawerToggle={() => {}} />
        {children}
      </Container>
    </Box>
  );
};

export default AuthLayout;
