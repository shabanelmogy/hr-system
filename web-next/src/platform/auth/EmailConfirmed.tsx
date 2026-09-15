"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Card, CardContent, CircularProgress, Stack, Typography } from "@mui/material";
import { authService } from "./services/authService";

const EmailConfirmed = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t } = useTranslation();
  const [status, setStatus] = useState<"loading" | "success" | "error" | "invalid">("loading");

  useEffect(() => {
    let active = true;
    let redirectTimer: ReturnType<typeof setTimeout> | undefined;

    const confirmEmail = async () => {
      const userId = searchParams.get("userId");
      const code = searchParams.get("code");

      if (!userId || !code) {
        if (active) setStatus("invalid");
        return;
      }

      const request = {
        userId: userId,
        code: code,
      };

      try {
        await authService.confirmEmail(request);
        if (!active) return;
        setStatus("success");
        redirectTimer = setTimeout(() => {
          router.replace("/login");
        }, 1000);
      } catch {
        if (active) setStatus("error");
      }
    };

    void confirmEmail();
    return () => {
      active = false;
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [router, searchParams]);

  const message = status === "loading"
    ? t("auth.confirmingEmail")
    : status === "success"
      ? t("auth.emailConfirmed")
      : status === "error"
        ? t("auth.emailConfirmationFailed")
        : t("auth.invalidEmailConfirmationLink");

  return (
    <Card sx={{ width: "min(92vw, 440px)", mx: "auto", mt: { xs: 4, sm: 8 } }}>
      <CardContent>
        <Stack spacing={3} sx={{ alignItems: "center", textAlign: "center" }} aria-live="polite">
          {status === "loading" ? <CircularProgress aria-label={message} /> : null}
          {status === "loading" ? (
            <Typography>{message}</Typography>
          ) : (
            <Alert severity={status === "success" ? "success" : "error"} sx={{ width: "100%" }}>
              {message}
            </Alert>
          )}
          {status !== "loading" && status !== "success" ? (
            <Button type="button" variant="contained" onClick={() => router.replace("/login")}>
              {t("auth.returnToLogin")}
            </Button>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default EmailConfirmed;
