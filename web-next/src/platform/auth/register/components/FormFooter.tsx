"use client";
import { Box, Typography, Link as MuiLink, useTheme } from "@mui/material";
import Link from "next/link";
import type { Route } from "next";
import type { ElementType } from "react";
import { appRoutes } from "@/config/routes";

interface FormFooterProps {
  t: (key: string) => string;
}

export default function FormFooter({ t }: FormFooterProps) {
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
        sx={{
          color: "text.secondary",
          fontSize: "0.85rem"
        }}>
        {t("auth.alreadyHaveAccount")}{" "}
        <MuiLink
          component={Link as ElementType}
          href={appRoutes.auth.login as Route}
          color="primary"
          sx={{
            textDecoration: "none",
            fontWeight: "bold",
            fontSize: "0.85rem",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          {t("auth.signIn")}
        </MuiLink>
      </Typography>
    </Box>
  );
}
