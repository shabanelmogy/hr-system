"use client";

import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Button, Stack, Typography, alpha, keyframes, useTheme } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { appRoutes } from "@/config/routes";

const floatUp = keyframes`
  0%, 100% { transform: translateY(0) rotate(-3deg); }
  50% { transform: translateY(-10px) rotate(3deg); }
`;

const pulseRing = keyframes`
  0%, 100% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.05); opacity: 0.3; }
`;

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
`;

export interface ForbiddenPageProps {
  /** Optional localized message shown under the heading. */
  message?: ReactNode;
}

export default function ForbiddenPage({ message }: ForbiddenPageProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const primary = theme.palette.primary.main;

  return (
    <Box
      component="section"
      aria-labelledby="forbidden-title"
      dir={theme.direction}
      sx={{
        minHeight: "calc(100vh - 112px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 6,
        backgroundColor: "background.default",
        "@media (prefers-reduced-motion: reduce)": {
          "&, & *": {
            animation: "none !important",
            transition: "none !important",
          },
        },
      }}
    >
      <Stack
        spacing={3}
        sx={{
          alignItems: "center",
          width: "100%",
          maxWidth: 480,
          textAlign: "center",
          animation: `${fadeSlideIn} 0.6s ease both`,
        }}
      >
        <Box sx={{ position: "relative", display: "inline-flex" }} aria-hidden="true">
          <Box
            sx={{
              position: "absolute",
              inset: -16,
              borderRadius: "50%",
              border: `2px solid ${alpha(theme.palette.error.main, 0.35)}`,
              animation: `${pulseRing} 2.4s ease-in-out infinite`,
            }}
          />
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "error.main",
              backgroundColor: alpha(theme.palette.error.main, 0.12),
              border: `1px solid ${alpha(theme.palette.error.main, 0.3)}`,
              animation: `${floatUp} 3.6s ease-in-out infinite`,
              boxShadow: `0 8px 28px ${alpha(theme.palette.error.main, 0.16)}`,
            }}
          >
            <LockOutlinedIcon sx={{ fontSize: 40 }} />
          </Box>
        </Box>

        <Typography
          component="div"
          aria-hidden="true"
          sx={{
            color: "error.main",
            fontSize: { xs: "5rem", sm: "7rem" },
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: 0,
            userSelect: "none",
          }}
        >
          403
        </Typography>

        <Box>
          <Typography
            id="forbidden-title"
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}
          >
            {t("authorization.forbidden.title")}
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 390, mx: "auto" }}
          >
            {message ?? t("authorization.forbidden.message")}
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<HomeOutlinedIcon />}
          onClick={() => router.replace(appRoutes.home)}
          sx={{
            width: "100%",
            maxWidth: 260,
            borderRadius: 2,
            py: 1.25,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: `0 4px 16px ${alpha(primary, 0.3)}`,
            "&:hover": {
              boxShadow: `0 6px 20px ${alpha(primary, 0.4)}`,
              transform: "translateY(-1px)",
            },
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
        >
          {t("authorization.forbidden.dashboard")}
        </Button>
      </Stack>
    </Box>
  );
}
