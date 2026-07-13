"use client";

import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import MonitorOutlinedIcon from "@mui/icons-material/MonitorOutlined";
import {
  Box,
  Button,
  IconButton,
  Popover,
  Tooltip,
  Typography,
  alpha,
} from "@mui/material";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useTranslation } from "react-i18next";

type DisplayMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
};

const emptyDimensions = "-- x --";

export default function DisplayDebugger() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [metrics, setMetrics] = useState<DisplayMetrics | null>(null);
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let animationFrame = 0;

    const measure = () => {
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        const viewport = window.visualViewport;
        setMetrics({
          viewportWidth: Math.round(viewport?.width ?? window.innerWidth),
          viewportHeight: Math.round(viewport?.height ?? window.innerHeight),
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          pixelRatio: window.devicePixelRatio,
        });
      });
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("orientationchange", measure);
    window.visualViewport?.addEventListener("resize", measure);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", measure);
      window.removeEventListener("orientationchange", measure);
      window.visualViewport?.removeEventListener("resize", measure);
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
    };
  }, []);

  const openDebugger = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const copyDimensions = async () => {
    if (!metrics) return;

    const report = [
      `${t("displayDebugger.viewport")}: ${formatSize(metrics.viewportWidth, metrics.viewportHeight)}`,
      `${t("displayDebugger.screen")}: ${formatSize(metrics.screenWidth, metrics.screenHeight)}`,
      `${t("displayDebugger.pixelRatio")}: ${formatPixelRatio(metrics.pixelRatio)}`,
    ].join("\n");

    const copySucceeded = await copyText(report);
    if (copySucceeded) {
      setCopied(true);
      if (copyResetTimer.current) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = setTimeout(() => setCopied(false), 2_000);
    } else {
      setCopied(false);
    }
  };

  const viewportSize = metrics
    ? formatSize(metrics.viewportWidth, metrics.viewportHeight)
    : emptyDimensions;

  return (
    <>
      <Tooltip title={t("displayDebugger.open")}>
        <IconButton
          color="inherit"
          aria-label={t("displayDebugger.open")}
          onClick={openDebugger}
          sx={{ display: { xs: "inline-flex", xl: "none" } }}
        >
          <MonitorOutlinedIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title={t("displayDebugger.open")}>
        <Button
          color="inherit"
          variant="outlined"
          startIcon={<MonitorOutlinedIcon fontSize="small" />}
          onClick={openDebugger}
          sx={(theme) => ({
            display: { xs: "none", xl: "inline-flex" },
            height: 34,
            minWidth: 0,
            px: 1.25,
            borderColor: alpha(theme.palette.common.white, 0.28),
            fontVariantNumeric: "tabular-nums",
            whiteSpace: "nowrap",
            "&:hover": {
              borderColor: alpha(theme.palette.common.white, 0.5),
              backgroundColor: alpha(theme.palette.common.white, 0.08),
            },
          })}
        >
          {viewportSize}
        </Button>
      </Tooltip>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              width: 290,
              mt: 1,
              borderRadius: 1,
              border: 1,
              borderColor: "divider",
              overflow: "hidden",
              boxShadow: 8,
            },
          },
        }}
      >
        <Box
          sx={(theme) => ({
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 2,
            py: 1.5,
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            borderBottom: 1,
            borderColor: "divider",
          })}
        >
          <MonitorOutlinedIcon color="primary" />
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            {t("displayDebugger.title")}
          </Typography>
        </Box>

        <Box sx={{ px: 2 }}>
          <MetricRow label={t("displayDebugger.viewport")} value={viewportSize} />
          <MetricRow
            label={t("displayDebugger.screen")}
            value={
              metrics
                ? formatSize(metrics.screenWidth, metrics.screenHeight)
                : emptyDimensions
            }
          />
          <MetricRow
            label={t("displayDebugger.pixelRatio")}
            value={metrics ? formatPixelRatio(metrics.pixelRatio) : "--"}
            last
          />
        </Box>

        <Box sx={{ p: 1.5, borderTop: 1, borderColor: "divider" }}>
          <Button
            fullWidth
            variant="contained"
            disabled={!metrics}
            startIcon={copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
            onClick={() => void copyDimensions()}
          >
            {t(copied ? "displayDebugger.copied" : "displayDebugger.copy")}
          </Button>
        </Box>
      </Popover>
    </>
  );
}

function MetricRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <Box
      sx={{
        minHeight: 48,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        borderBottom: last ? 0 : 1,
        borderColor: "divider",
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontVariantNumeric: "tabular-nums",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

function formatSize(width: number, height: number) {
  return `${width} x ${height}`;
}

function formatPixelRatio(value: number) {
  return String(Number(value.toFixed(2)));
}

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = value;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.select();

    try {
      return document.execCommand("copy");
    } finally {
      textArea.remove();
    }
  }
}
