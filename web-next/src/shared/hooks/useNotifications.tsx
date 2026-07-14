import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import useSnackbar from "./useSnackbar";

const useNotifications = () => {
  const { t } = useTranslation();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const showError = useCallback((message: unknown, title = "common.error") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("error", messages, t(title));
  }, [showSnackbar, t]);

  const showSuccess = useCallback((message: unknown, title = "common.success") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("success", messages, t(title));
  }, [showSnackbar, t]);

  const showInfo = useCallback((message: unknown, title = "common.info") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("info", messages, t(title));
  }, [showSnackbar, t]);

  const showWarning = useCallback((message: unknown, title = "common.warning") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("warning", messages, t(title));
  }, [showSnackbar, t]);

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
    SnackbarComponent,
  };
};

export default useNotifications;
