import { Box, Typography, Link as MuiLink, useTheme } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

interface FormFooterProps {
  t: (key: string) => string;
  appRoutes: {
    login: string;
  };
}

/* eslint-disable react/prop-types */
export default function FormFooter({ t, appRoutes }: FormFooterProps) {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: 1,
        borderTop: `1px solid ${theme.palette.divider}`,
        bgcolor: theme.palette.background.paper,
        textAlign: "center",
      }}
    >
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.85rem" }}
      >
        {t("auth.alreadyHaveAccount") || "Already have an account?"}{" "}
        <MuiLink
          component={RouterLink}
          to={appRoutes.login}
          color="primary"
          sx={{
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "0.85rem",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {t("auth.signIn") || "Sign in"}
        </MuiLink>
      </Typography>
    </Box>
  );
}
