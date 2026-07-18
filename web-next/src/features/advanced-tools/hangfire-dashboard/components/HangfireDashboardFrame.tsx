"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

type DashboardState = "checking" | "ready" | "error";

export default function HangfireDashboardFrame() {
  const { t } = useTranslation();
  const [state, setState] = useState<DashboardState>("checking");
  const [attempt, setAttempt] = useState(0);

  const retry = useCallback(() => {
    setState("checking");
    setAttempt((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    void fetch("/hangfire", {
      cache: "no-store",
      credentials: "same-origin",
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Hangfire returned ${response.status}`);
        setState("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setState("error");
      });

    return () => controller.abort();
  }, [attempt]);

  return (
    <Box
      sx={{
        height: {
          xs: "max(32rem, calc(100dvh - 6.5rem))",
          md: "max(36rem, calc(100dvh - 7.25rem))",
        },
        minWidth: 0,
        position: "relative",
        width: "100%",
      }}
    >
      {state === "checking" ? (
        <Box
          role="status"
          sx={{ display: "grid", height: "100%", placeItems: "center" }}
        >
          <CircularProgress aria-label={t("hangfireDashboard.loading")} />
        </Box>
      ) : null}

      {state === "error" ? (
        <Alert
          action={
            <Button
              color="inherit"
              onClick={retry}
              size="small"
              startIcon={<RefreshCw size={16} />}
            >
              {t("hangfireDashboard.retry")}
            </Button>
          }
          severity="error"
        >
          {t("hangfireDashboard.loadError")}
        </Alert>
      ) : null}

      {state === "ready" ? (
        <Box
          component="iframe"
          src="/hangfire"
          title={t("advancedTools.hangfireDashboard")}
          sx={{ border: 0, height: "100%", width: "100%" }}
        />
      ) : null}
    </Box>
  );
}
