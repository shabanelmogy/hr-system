"use client";

import { useCallback } from "react";
import { showErrorDialog, showToast } from "../components/feedback/transient";

export type NotificationSeverity = "error" | "warning" | "info" | "success";

const useSnackbar = () => {
  const showSnackbar = useCallback(
    (
      severity: NotificationSeverity | string,
      messages: unknown | unknown[],
      title = "",
    ) => {
      const normalizedMessages = normalizeMessage(messages);

      if (severity === "error") {
        showErrorDialog(
          { title: title || "Error", messages: normalizedMessages },
          title || "Error",
        );
        return;
      }

      const message = formatToastMessage(title, normalizedMessages);
      if (severity === "success") {
        showToast.success(message);
      } else if (severity === "warning") {
        showToast.warning(message);
      } else {
        showToast.info(message);
      }
    },
    [],
  );

  const closeSnackbar = useCallback(() => {
    showToast.dismiss();
  }, []);

  return {
    showSnackbar,
    SnackbarComponent: null,
    closeSnackbar,
  };
};

function normalizeMessage(value: unknown): string[] {
  if (Array.isArray(value)) return value.flatMap(normalizeMessage);
  if (value === null || value === undefined) return [];
  if (typeof value === "string") return value.trim() ? [value.trim()] : [];
  if (value instanceof Error) return [value.message];
  return [String(value)];
}

function formatToastMessage(title: string, messages: string[]): string {
  const message = messages.join(" | ");
  if (!title) return message;
  if (!message || message === title) return title;
  return `${title}: ${message}`;
}

export default useSnackbar;
