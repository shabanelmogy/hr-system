"use client";

import LockClockRoundedIcon from "@mui/icons-material/LockClockRounded";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import apiClient from "@/lib/api/client";
import { useSession } from "@/lib/auth/SessionContext";
import { AppReadOnlyProvider } from "@/shared/contexts/AppReadOnlyContext";

const maxTimerDelayMs = 2_147_000_000;

export function TenantAccessBoundary({ children }: { children: ReactNode }) {
  const { user } = useSession();
  const accessKey = [
    user?.tenantId,
    user?.tenantSubscriptionStatus,
    user?.tenantSubscriptionEndsOn,
    user?.tenantReadOnly,
  ].join(":");

  return (
    <TenantAccessState key={accessKey} user={user}>
      {children}
    </TenantAccessState>
  );
}

function TenantAccessState({
  children,
  user,
}: {
  children: ReactNode;
  user: ReturnType<typeof useSession>["user"];
}) {
  const { t, i18n } = useTranslation();
  const [noticeOpen, setNoticeOpen] = useState(true);
  const [serverReadOnly, setServerReadOnly] = useState(false);
  const [subscriptionEnded, setSubscriptionEnded] = useState(() => hasSubscriptionEnded(user));
  const isSuperAdmin = user?.roles.some(
    (role) => role.toLowerCase() === "super_admin",
  ) ?? false;
  const isReadOnly = !isSuperAdmin && Boolean(
    user &&
      (serverReadOnly ||
        user.tenantReadOnly ||
        user.tenantSubscriptionStatus.toLowerCase() === "expired" ||
        subscriptionEnded),
  );

  useEffect(() => {
    const endsAt = parseEndTime(user?.tenantSubscriptionEndsOn);
    if (endsAt === null || endsAt <= Date.now()) return;

    const timer = window.setTimeout(
      () => setSubscriptionEnded(true),
      Math.min(endsAt - Date.now() + 1_000, maxTimerDelayMs),
    );
    return () => window.clearTimeout(timer);
  }, [user?.tenantSubscriptionEndsOn]);

  const showNotice = useCallback(() => setNoticeOpen(true), []);
  const handleServerBlocked = useCallback(() => {
    setServerReadOnly(true);
    setNoticeOpen(true);
  }, []);

  useEffect(
    () => apiClient.configureReadOnlyGuard({ isReadOnly: () => isReadOnly, onBlocked: handleServerBlocked }),
    [handleServerBlocked, isReadOnly],
  );

  const formattedEndDate = user?.tenantSubscriptionEndsOn
    ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "long" }).format(
        new Date(user.tenantSubscriptionEndsOn),
      )
    : null;

  return (
    <AppReadOnlyProvider isReadOnly={isReadOnly} onBlockedAction={showNotice}>
      {children}

      <Dialog
        open={isReadOnly && noticeOpen}
        onClose={() => setNoticeOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LockClockRoundedIcon color="warning" />
          {t("tenantAccess.title")}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Alert severity="warning" variant="outlined">
              {t("tenantAccess.description")}
            </Alert>
            {formattedEndDate ? (
              <Typography color="text.secondary" variant="body2">
                {t("tenantAccess.endedOn", { date: formattedEndDate })}
              </Typography>
            ) : null}
            <Typography variant="body2">
              {t("tenantAccess.readOnlyExplanation")}
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoticeOpen(false)} variant="contained">
            {t("actions.close")}
          </Button>
        </DialogActions>
      </Dialog>
    </AppReadOnlyProvider>
  );
}

function parseEndTime(value: string | null | undefined): number | null {
  if (!value) return null;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function hasSubscriptionEnded(
  user: ReturnType<typeof useSession>["user"],
): boolean {
  const endsAt = parseEndTime(user?.tenantSubscriptionEndsOn);
  return endsAt !== null && endsAt <= Date.now();
}
