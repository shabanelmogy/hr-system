"use client";

import CloseIcon from "@mui/icons-material/Close";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const ERROR_DIALOG_EVENT = "hrms:error-dialog";
const DUPLICATE_WINDOW_MS = 750;

export type ErrorDialogDetails = {
  reportId?: string;
  title?: string;
  messages: string[];
  status?: number;
  traceId?: string;
  errorType?: string;
  errorCodes?: string[];
  detail?: string;
  occurredAt?: string;
  path?: string;
  environment?: ErrorEnvironment;
};

type ErrorEnvironment = {
  appVersion: string;
  appLanguage: string;
  browserLanguage: string;
  direction: string;
  theme: string;
  timeZone: string;
  browser: string;
  platform: string;
  viewport: string;
  screen: string;
  online: boolean;
};

let lastErrorSignature = "";
let lastErrorTime = 0;

export function showErrorDialog(
  error: unknown,
  fallbackTitle = "Error",
): void {
  if (typeof window === "undefined") return;

  const details = normalizeErrorDetails(error, fallbackTitle);
  const signature = JSON.stringify([
    details.title,
    details.messages,
    details.status,
    details.traceId,
    details.errorType,
    details.errorCodes,
    details.detail,
  ]);
  const now = Date.now();

  if (signature === lastErrorSignature && now - lastErrorTime < DUPLICATE_WINDOW_MS) {
    return;
  }

  lastErrorSignature = signature;
  lastErrorTime = now;
  window.dispatchEvent(
    new CustomEvent<ErrorDialogDetails>(ERROR_DIALOG_EVENT, {
      detail: details,
    }),
  );
}

export function ErrorDialogHost() {
  const { t } = useTranslation();
  const [details, setDetails] = useState<ErrorDialogDetails | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleError = (event: Event) => {
      const customEvent = event as CustomEvent<ErrorDialogDetails>;
      setCopied(false);
      setDetails(customEvent.detail);
    };

    window.addEventListener(ERROR_DIALOG_EVENT, handleError);
    return () => window.removeEventListener(ERROR_DIALOG_EVENT, handleError);
  }, []);

  const formattedError = useMemo(
    () => (details ? formatErrorDetails(details, t("errorDialog.errorReport")) : ""),
    [details, t],
  );

  const close = useCallback(() => {
    setDetails(null);
    setCopied(false);
  }, []);

  const copyError = async () => {
    if (!formattedError) return;
    await copyText(formattedError);
    setCopied(true);
  };

  const shareOnWhatsApp = () => {
    if (!formattedError) return;
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(formattedError)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog
      open={Boolean(details)}
      onClose={close}
      fullWidth
      maxWidth="sm"
      aria-labelledby="error-dialog-title"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 2,
            borderTop: "4px solid",
            borderColor: "error.main",
            backgroundImage: "none",
          },
        },
      }}
    >
      <DialogTitle id="error-dialog-title" sx={{ pr: 7, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <ErrorOutlineRoundedIcon color="error" fontSize="large" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              {details?.title || t("errorDialog.title")}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              {t("errorDialog.subtitle")}
            </Typography>
          </Box>
        </Box>
        <Tooltip title={t("general.close", { defaultValue: "Close" })}>
          <IconButton
            aria-label={t("general.close", { defaultValue: "Close" })}
            onClick={close}
            size="small"
            sx={{ position: "absolute", insetInlineEnd: 16, top: 16 }}
          >
            <CloseIcon />
          </IconButton>
        </Tooltip>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ py: 2.5 }}>
        <List disablePadding aria-label={t("errorDialog.messages")}>
          {details?.messages.map((message, index) => (
            <ListItem key={`${message}-${index}`} disableGutters alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 28, pt: 0.75 }}>
                <Box
                  sx={{
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    bgcolor: "error.main",
                  }}
                />
              </ListItemIcon>
              <ListItemText
                primary={message}
                slotProps={{
                  primary: {
                    sx: { overflowWrap: "anywhere", lineHeight: 1.55 },
                  },
                }}
              />
            </ListItem>
          ))}
        </List>

        {(details?.reportId || details?.status || details?.traceId) && (
          <Box
            sx={{
              mt: 2,
              pt: 2,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "grid",
              gap: 0.75,
            }}
          >
            {details.reportId && (
              <Typography variant="caption" color="text.secondary">
                {t("errorDialog.reportId")}: {details.reportId}
              </Typography>
            )}
            {details.status && (
              <Typography variant="caption" color="text.secondary">
                {t("errorDialog.status")}: {details.status}
              </Typography>
            )}
            {details.traceId && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ overflowWrap: "anywhere" }}
              >
                {t("errorDialog.traceId")}: {details.traceId}
              </Typography>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
        <Button onClick={close} color="inherit">
          {t("errorDialog.close")}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button
          onClick={copyError}
          variant="outlined"
          startIcon={<ContentCopyOutlinedIcon />}
        >
          {copied ? t("errorDialog.copied") : t("errorDialog.copy")}
        </Button>
        <Button
          onClick={shareOnWhatsApp}
          variant="contained"
          color="success"
          startIcon={<WhatsAppIcon />}
        >
          {t("errorDialog.whatsApp")}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function normalizeErrorDetails(
  error: unknown,
  fallbackTitle: string,
): ErrorDialogDetails {
  if (typeof error === "string") {
    return createDetails(fallbackTitle, [error]);
  }

  if (Array.isArray(error)) {
    return createDetails(fallbackTitle, toMessages(error));
  }

  if (error && typeof error === "object") {
    const value = error as Record<string, unknown>;
    const responseData = asRecord(asRecord(value.response)?.data);
    const source = responseData ?? value;
    const errors =
      source.errors ?? value.errors ?? source.messages ?? value.messages;
    const messages = toMessages(errors);
    const detail = asString(source.detail) ?? asString(value.detail);
    const message = asString(source.message) ?? asString(value.message);

    return createDetails(
      asString(source.title) ?? asString(value.title) ?? fallbackTitle,
      messages.length > 0 ? messages : [detail ?? message ?? fallbackTitle],
      asNumber(source.status) ?? asNumber(value.status),
      asString(source.traceId) ?? asString(value.traceId),
      asString(source.type) ?? asString(value.type),
      toMessages(source.errorCodes ?? value.errorCodes),
      detail,
    );
  }

  return createDetails(fallbackTitle, [fallbackTitle]);
}

function createDetails(
  title: string,
  messages: string[],
  status?: number,
  traceId?: string,
  errorType?: string,
  errorCodes?: string[],
  detail?: string,
): ErrorDialogDetails {
  return {
    reportId: createReportId(),
    title,
    messages: messages.filter(Boolean),
    status,
    traceId,
    errorType,
    errorCodes: errorCodes?.length ? errorCodes : undefined,
    detail,
    occurredAt: new Date().toISOString(),
    path:
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}`
        : undefined,
    environment: getErrorEnvironment(),
  };
}

function toMessages(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.flatMap(toMessages);
  }

  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap(toMessages);
  }

  const message = asString(value);
  return message ? [message] : [];
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function formatErrorDetails(details: ErrorDialogDetails, heading: string): string {
  const lines = [heading];
  if (details.reportId) lines.push(`Report ID: ${details.reportId}`);
  lines.push("", details.title ?? "Error", "");
  lines.push(...details.messages.map((message) => `- ${message}`));

  if (details.status) lines.push("", `Status: ${details.status}`);
  if (details.traceId) lines.push(`Trace ID: ${details.traceId}`);
  if (details.errorType) lines.push(`Error type: ${details.errorType}`);
  if (details.errorCodes?.length) {
    lines.push(`Error codes: ${details.errorCodes.join(", ")}`);
  }
  if (
    details.detail &&
    !details.messages.some((message) => message === details.detail)
  ) {
    lines.push(`Detail: ${details.detail}`);
  }
  if (details.path) lines.push(`Page: ${details.path}`);
  if (details.occurredAt) {
    const occurredAt = new Date(details.occurredAt);
    lines.push(`Local time: ${occurredAt.toLocaleString()}`);
    lines.push(`UTC time: ${details.occurredAt}`);
  }

  if (details.environment) {
    const environment = details.environment;
    lines.push(
      "",
      "Technical context",
      `App version: ${environment.appVersion}`,
      `App language: ${environment.appLanguage}`,
      `Browser language: ${environment.browserLanguage}`,
      `Direction: ${environment.direction}`,
      `Theme: ${environment.theme}`,
      `Time zone: ${environment.timeZone}`,
      `Platform: ${environment.platform}`,
      `Viewport: ${environment.viewport}`,
      `Screen: ${environment.screen}`,
      `Online: ${environment.online ? "Yes" : "No"}`,
      `Browser: ${environment.browser}`,
    );
  }

  return lines.join("\n");
}

function createReportId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function getErrorEnvironment(): ErrorEnvironment | undefined {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return undefined;
  }

  return {
    appVersion: process.env.NEXT_PUBLIC_APP_VERSION || "development",
    appLanguage: document.documentElement.lang || "unknown",
    browserLanguage: navigator.language || "unknown",
    direction: document.documentElement.dir || "ltr",
    theme: document.documentElement.dataset.theme || "unknown",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "unknown",
    browser: navigator.userAgent,
    platform: navigator.platform || "unknown",
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${window.screen.width}x${window.screen.height}`,
    online: navigator.onLine,
  };
}

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}
