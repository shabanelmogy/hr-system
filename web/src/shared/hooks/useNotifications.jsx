import { useTranslation } from "react-i18next";
import useSnackbar from "./useSnackbar";

const useNotifications = () => {
  const { t } = useTranslation();
  const { showSnackbar, SnackbarComponent } = useSnackbar();

  const showError = (message, title = "common.error") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("error", messages, t(title));
  };

  const showSuccess = (message, title = "common.success") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("success", messages, t(title));
  };

  const showInfo = (message, title = "common.info") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("info", messages, t(title));
  };

  const showWarning = (message, title = "common.warning") => {
    // Ensure messages are in an array format for consistency
    const messages = Array.isArray(message) ? message : [message];
    showSnackbar("warning", messages, t(title));
  };

  return {
    showError,
    showSuccess,
    showInfo,
    showWarning,
    SnackbarComponent,
  };
};

export default useNotifications;
