"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import {
  Close as CloseIcon,
  ContentCopyOutlined as CopyIcon,
  ErrorOutlineRounded as ErrorIcon,
  ShareOutlined as ShareIcon,
  WhatsApp as WhatsAppIcon,
} from "@mui/icons-material";
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
import { useTranslation } from "react-i18next";
import {
  dismissErrorDialog,
  getErrorDialogSnapshot,
  subscribeToErrorDialog,
} from "./errorDialogStore";
import { formatErrorReport } from "./formatErrorReport";
import type { ErrorDialogDetails } from "./types";

const getServerSnapshot = () => null;

export function ErrorDialogHost() {
  const details = useSyncExternalStore(
    subscribeToErrorDialog,
    getErrorDialogSnapshot,
    getServerSnapshot,
  );

  if (!details) return null;
  return <ErrorDialogView key={details.reportId ?? details.occurredAt} details={details} />;
}

function ErrorDialogView({ details }: { details: ErrorDialogDetails }) {
  const { t } = useTranslation();
  const isDevelopment = process.env.NODE_ENV === "development";
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const [shareState, setShareState] = useState<"idle" | "shared" | "failed">("idle");
  const visibleMessages = useMemo(
    () =>
      details.messages.length
        ? details.messages
        : [t("errorDialog.unknownMessage")],
    [details.messages, t],
  );
  const reportDetails = useMemo(
    () => ({ ...details, messages: visibleMessages }),
    [details, visibleMessages],
  );
  const formattedError = useMemo(
    () =>
      formatErrorReport(reportDetails, t("errorDialog.errorReport"), {
        includeTechnical: isDevelopment,
      }),
    [isDevelopment, reportDetails, t],
  );
  const technicalDetails = useMemo(
    () => formatTechnicalDetails(details),
    [details],
  );
  const close = () => dismissErrorDialog(details.reportId);

  const copyError = async () => {
    try {
      await copyText(formattedError);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  const shareOnWhatsApp = () => {
    const shareUrl = `https://wa.me/?text=${encodeURIComponent(formattedError)}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  };

  const shareError = async () => {
    setShareState("idle");
    try {
      if (navigator.share) {
        await navigator.share({
          title: t("errorDialog.errorReport"),
          text: formattedError,
        });
        setShareState("shared");
        return;
      }

      await copyText(formattedError);
      setShareState("shared");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setShareState("failed");
    }
  };

  return (
    <Dialog
      open
      onClose={close}
      fullWidth
      maxWidth="sm"
      aria-labelledby="error-dialog-title"
      aria-describedby="error-dialog-subtitle"
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
      <DialogTitle id="error-dialog-title" sx={{ pe: 7, pb: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <ErrorIcon color="error" fontSize="large" />
          <Box sx={{ minWidth: 0 }}>
            <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
              {details.title || t("errorDialog.title")}
            </Typography>
            <Typography
              id="error-dialog-subtitle"
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
          {visibleMessages.map((message, index) => (
            <ListItem key={`${index}-${message}`} disableGutters alignItems="flex-start">
              <ListItemIcon sx={{ minWidth: 28, pt: 0.75 }}>
                <Box
                  sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "error.main" }}
                />
              </ListItemIcon>
              <ListItemText
                primary={message}
                slotProps={{ primary: { sx: { overflowWrap: "anywhere", lineHeight: 1.55 } } }}
              />
            </ListItem>
          ))}
        </List>

        {(details.reportId ||
          details.status != null ||
          details.traceId ||
          details.correlationId) && (
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
            {details.status != null && (
              <Typography variant="caption" color="text.secondary">
                {t("errorDialog.status")}: {details.status}
              </Typography>
            )}
            {details.traceId && (
              <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                {t("errorDialog.traceId")}: {details.traceId}
              </Typography>
            )}
            {details.correlationId && (
              <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                {t("errorDialog.correlationId")}: {details.correlationId}
              </Typography>
            )}
          </Box>
        )}

        {isDevelopment && technicalDetails && (
          <Box
            sx={{
              mt: 2,
              p: 1.5,
              border: "1px solid",
              borderColor: "warning.main",
              borderRadius: 1,
              bgcolor: "action.hover",
            }}
          >
            <Typography variant="subtitle2" color="warning.main" sx={{ mb: 0.75 }}>
              {t("errorDialog.technicalDetails")}
            </Typography>
            <Typography
              component="pre"
              variant="caption"
              color="text.secondary"
              sx={{ m: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere" }}
            >
              {technicalDetails}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{ px: 3, py: 2, gap: 1, flexWrap: "wrap", borderTop: "1px solid", borderColor: "divider" }}
      >
        <Button onClick={close} color="inherit">
          {t("errorDialog.close")}
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button onClick={() => void copyError()} variant="outlined" startIcon={<CopyIcon />}>
          {copyState === "copied"
            ? t("errorDialog.copied")
            : copyState === "failed"
              ? t("errorDialog.copyFailed")
              : t("errorDialog.copy")}
        </Button>
        <Button onClick={() => void shareError()} variant="outlined" startIcon={<ShareIcon />}>
          {shareState === "shared"
            ? t("errorDialog.shared")
            : shareState === "failed"
              ? t("errorDialog.shareFailed")
              : t("errorDialog.share")}
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
  const copied = document.execCommand("copy");
  textarea.remove();
  if (!copied) throw new Error("Clipboard copy failed");
}

function formatTechnicalDetails(details: ErrorDialogDetails): string {
  const lines: string[] = [];
  if (details.errorType) lines.push(`Type: ${details.errorType}`);
  if (details.errorCodes?.length) lines.push(`Codes: ${details.errorCodes.join(", ")}`);
  if (details.detail && !details.messages.includes(details.detail)) {
    lines.push(`Detail: ${details.detail}`);
  }
  if (details.stack) lines.push(`Stack: ${details.stack}`);
  if (details.environment) {
    lines.push(
      `App version: ${details.environment.appVersion}`,
      `Platform: ${details.environment.platform}`,
      `Browser: ${details.environment.browser}`,
      `Viewport: ${details.environment.viewport}`,
      `Screen: ${details.environment.screen}`,
      `Language: ${details.environment.appLanguage}`,
      `Direction: ${details.environment.direction}`,
      `Theme: ${details.environment.theme}`,
      `Online: ${details.environment.online ? "Yes" : "No"}`,
    );
  }
  return lines.join("\n");
}
