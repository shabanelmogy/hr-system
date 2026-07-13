"use client";

import { useEffect, useState } from "react";
import { Box, Button, Stack, Typography, alpha, keyframes, useTheme } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ArrowBackOutlinedIcon from "@mui/icons-material/ArrowBackOutlined";
import { useRouter } from "next/navigation";

const floatUp = keyframes`
  0%   { transform: translateY(0px) rotate(-3deg); }
  50%  { transform: translateY(-12px) rotate(3deg); }
  100% { transform: translateY(0px) rotate(-3deg); }
`;

const pulseRing = keyframes`
  0%   { transform: scale(0.9); opacity: 0.7; }
  50%  { transform: scale(1.05); opacity: 0.3; }
  100% { transform: scale(0.9); opacity: 0.7; }
`;

const fadeSlideIn = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

interface ForbiddenPageProps {
  /** Message shown under the heading. */
  message?: string;
}

export default function ForbiddenPage({
  message = "You don't have permission to view this page. Contact your administrator if you believe this is a mistake.",
}: ForbiddenPageProps) {
  const theme = useTheme();
  const router = useRouter();
  const isDark = theme.palette.mode === "dark";

  // Staggered mount for child animations
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const primary = theme.palette.primary.main;
  const primaryDark = theme.palette.primary.dark;

  return (
    <Box
      component="main"
      sx={{
        minHeight: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 8,
        position: "relative",
        overflow: "hidden",
        background: isDark
          ? `radial-gradient(ellipse at 60% 20%, ${alpha(primaryDark, 0.18)} 0%, transparent 60%),
             radial-gradient(ellipse at 20% 80%, ${alpha(theme.palette.error.dark, 0.12)} 0%, transparent 55%)`
          : `radial-gradient(ellipse at 60% 20%, ${alpha(primary, 0.08)} 0%, transparent 60%),
             radial-gradient(ellipse at 20% 80%, ${alpha(theme.palette.error.light, 0.12)} 0%, transparent 55%)`,
      }}
    >
      {/* Decorative blurred blobs */}
      <Box sx={{
        position: "absolute", width: 400, height: 400,
        borderRadius: "50%", top: "-15%", right: "-10%",
        background: alpha(primary, isDark ? 0.06 : 0.05),
        filter: "blur(80px)", pointerEvents: "none",
      }} />
      <Box sx={{
        position: "absolute", width: 300, height: 300,
        borderRadius: "50%", bottom: "-10%", left: "-5%",
        background: alpha(theme.palette.error.main, isDark ? 0.07 : 0.05),
        filter: "blur(60px)", pointerEvents: "none",
      }} />

      <Stack
        spacing={4}
        sx={{
          alignItems: "center",
          maxWidth: 480,
          textAlign: "center",
          opacity: mounted ? 1 : 0,
          animation: mounted ? `${fadeSlideIn} 0.6s ease forwards` : "none",
          position: "relative", zIndex: 1,
        }}
      >
        {/* Animated lock icon */}
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          {/* Outer pulsing ring */}
          <Box sx={{
            position: "absolute", inset: -16, borderRadius: "50%",
            border: `2px solid ${alpha(theme.palette.error.main, 0.35)}`,
            animation: `${pulseRing} 2.4s ease-in-out infinite`,
          }} />
          {/* Inner pulsing ring */}
          <Box sx={{
            position: "absolute", inset: -8, borderRadius: "50%",
            border: `1.5px solid ${alpha(theme.palette.error.main, 0.2)}`,
            animation: `${pulseRing} 2.4s ease-in-out infinite 0.4s`,
          }} />

          <Box sx={{
            width: 88, height: 88, borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.15)}, ${alpha(theme.palette.error.dark, 0.22)})`,
            border: `1.5px solid ${alpha(theme.palette.error.main, 0.3)}`,
            backdropFilter: "blur(12px)",
            animation: `${floatUp} 3.6s ease-in-out infinite`,
            boxShadow: `0 8px 32px ${alpha(theme.palette.error.main, 0.2)}, 0 0 0 1px ${alpha(theme.palette.error.main, 0.1)}`,
          }}>
            <LockOutlinedIcon sx={{ fontSize: 40, color: theme.palette.error.main }} />
          </Box>
        </Box>

        {/* Error code */}
        <Typography
          variant="h1"
          sx={{
            fontSize: { xs: "5rem", sm: "7rem" },
            fontWeight: 900,
            lineHeight: 1,
            background: `linear-gradient(135deg, ${theme.palette.error.main}, ${alpha(theme.palette.error.dark, 0.7)})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            letterSpacing: "-0.04em",
            userSelect: "none",
          }}
        >
          403
        </Typography>

        {/* Heading */}
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: 1.5, color: "text.primary" }}
          >
            Access Denied
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", lineHeight: 1.7, maxWidth: 360, mx: "auto" }}
          >
            {message}
          </Typography>
        </Box>

        {/* Divider with label */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%", px: 2 }}>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
          <Typography variant="caption" sx={{ color: "text.disabled", whiteSpace: "nowrap" }}>
            what would you like to do?
          </Typography>
          <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
        </Box>

        {/* Actions */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<ArrowBackOutlinedIcon />}
            onClick={() => router.back()}
            sx={{
              borderRadius: 2,
              py: 1.25,
              borderColor: alpha(theme.palette.text.primary, 0.2),
              color: "text.secondary",
              "&:hover": {
                borderColor: alpha(theme.palette.text.primary, 0.4),
                bgcolor: alpha(theme.palette.text.primary, 0.04),
              },
            }}
          >
            Go Back
          </Button>

          <Button
            fullWidth
            variant="contained"
            startIcon={<HomeOutlinedIcon />}
            onClick={() => router.push("/")}
            sx={{
              borderRadius: 2,
              py: 1.25,
              background: `linear-gradient(135deg, ${primary}, ${primaryDark})`,
              boxShadow: `0 4px 16px ${alpha(primary, 0.35)}`,
              "&:hover": {
                boxShadow: `0 6px 20px ${alpha(primary, 0.45)}`,
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Dashboard
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
}
