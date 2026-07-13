"use client";

import HomeOutlined from "@mui/icons-material/HomeOutlined";
import SearchOffOutlined from "@mui/icons-material/SearchOffOutlined";
import { Box, Button, Typography, keyframes } from "@mui/material";
import Link from "next/link";

// ─── animations ────────────────────────────────────────────────
const float = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  33%       { transform: translateY(-18px) rotate(4deg); }
  66%       { transform: translateY(-8px) rotate(-3deg); }
`;

const pulseRing = keyframes`
  0%   { transform: scale(0.8); opacity: 0.8; }
  50%  { transform: scale(1.15); opacity: 0.3; }
  100% { transform: scale(0.8); opacity: 0.8; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const orbDrift = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%       { transform: translate(30px, -20px) scale(1.08); }
  50%       { transform: translate(-20px, 30px) scale(0.94); }
  75%       { transform: translate(15px, 15px) scale(1.04); }
`;

export default function PageUnavailable() {
  return (
    <Box
      component="main"
      sx={{
        minHeight: "calc(100vh - 112px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 3,
        py: 6,
        position: "relative",
        overflow: "hidden",
        // Subtle mesh-gradient background
        background: (t) =>
          t.palette.mode === "dark"
            ? "radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.12) 0%, transparent 50%)"
            : "radial-gradient(ellipse at 20% 20%, rgba(124,58,237,0.07) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, rgba(99,102,241,0.06) 0%, transparent 50%)",
      }}
    >
      {/* ── Decorative floating orbs ── */}
      {[
        { size: 280, top: "5%",  left: "-8%",  delay: "0s",   dur: "12s", color: "rgba(124,58,237,0.12)" },
        { size: 200, top: "60%", right: "-6%", delay: "3s",   dur: "15s", color: "rgba(99,102,241,0.1)" },
        { size: 140, top: "80%", left: "10%",  delay: "6s",   dur: "10s", color: "rgba(167,139,250,0.1)" },
        { size: 100, top: "15%", right: "12%", delay: "1.5s", dur: "14s", color: "rgba(139,92,246,0.08)" },
      ].map((orb, i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            width: orb.size,
            height: orb.size,
            borderRadius: "50%",
            background: orb.color,
            top: orb.top,
            left: (orb as { left?: string }).left,
            right: (orb as { right?: string }).right,
            filter: "blur(40px)",
            animation: `${orbDrift} ${orb.dur} ${orb.delay} ease-in-out infinite`,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* ── Main card ── */}
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          p: { xs: 4, sm: 6 },
          borderRadius: 4,
          backdropFilter: "blur(16px)",
          border: (t) =>
            `1px solid ${t.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(124,58,237,0.12)"}`,
          background: (t) =>
            t.palette.mode === "dark"
              ? "rgba(30,25,60,0.6)"
              : "rgba(255,255,255,0.7)",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 24px 80px rgba(0,0,0,0.4)"
              : "0 24px 80px rgba(124,58,237,0.1)",
        }}
      >
        {/* ── Icon with pulse ring ── */}
        <Box
          sx={{
            position: "relative",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 3,
          }}
        >
          {/* Pulse ring */}
          <Box
            sx={{
              position: "absolute",
              width: 110,
              height: 110,
              borderRadius: "50%",
              border: "2px solid",
              borderColor: "primary.main",
              animation: `${pulseRing} 2.5s ease-in-out infinite`,
              opacity: 0.4,
            }}
          />
          {/* Icon wrapper */}
          <Box
            sx={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: (t) =>
                t.palette.mode === "dark"
                  ? "linear-gradient(135deg, rgba(124,58,237,0.3), rgba(99,102,241,0.2))"
                  : "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(99,102,241,0.08))",
              animation: `${float} 5s ease-in-out infinite`,
              border: "1px solid",
              borderColor: (t) =>
                t.palette.mode === "dark"
                  ? "rgba(167,139,250,0.3)"
                  : "rgba(124,58,237,0.2)",
            }}
          >
            <SearchOffOutlined
              sx={{
                fontSize: 44,
                color: "primary.main",
              }}
              aria-hidden="true"
            />
          </Box>
        </Box>

        {/* ── 404 label ── */}
        <Typography
          variant="overline"
          sx={{
            display: "block",
            letterSpacing: 6,
            color: "primary.main",
            fontWeight: 700,
            mb: 1,
            animation: `${slideUp} 0.6s 0.1s both`,
          }}
        >
          404
        </Typography>

        {/* ── Heading ── */}
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 800,
            background: (t) =>
              t.palette.mode === "dark"
                ? "linear-gradient(135deg, #e0d7ff 0%, #a78bfa 100%)"
                : "linear-gradient(135deg, #4c1d95 0%, #7c3aed 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: `${slideUp} 0.6s 0.2s both`,
          }}
        >
          Page Unavailable
        </Typography>

        {/* ── Description ── */}
        <Typography
          color="text.secondary"
          sx={{
            mb: 4,
            lineHeight: 1.7,
            animation: `${slideUp} 0.6s 0.35s both`,
          }}
        >
          The address is incorrect, the page no longer exists, or you do not
          have access to view it.
        </Typography>

        {/* ── CTA button ── */}
        <Box sx={{ animation: `${slideUp} 0.6s 0.5s both` }}>
          <Button
            component={Link}
            href="/"
            variant="contained"
            startIcon={<HomeOutlined />}
            size="large"
            sx={{
              px: 4,
              py: 1.4,
              borderRadius: 3,
              fontWeight: 700,
              textTransform: "none",
              fontSize: "1rem",
              background: "linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)",
              boxShadow: "0 8px 24px rgba(124,58,237,0.35)",
              transition: "all 0.25s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #6d28d9 0%, #4f46e5 100%)",
                boxShadow: "0 12px 32px rgba(124,58,237,0.5)",
                transform: "translateY(-2px)",
              },
              "&:active": {
                transform: "translateY(0)",
              },
            }}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
