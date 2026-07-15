import { HandleApiError } from "@/shared/services";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

type NotificationHandler = (message: unknown, title?: string) => void;
type ApiErrorHandler = (error: unknown) => void;

interface UseApiHandlerOptions {
  showSuccess?: NotificationHandler;
  showError?: NotificationHandler;
  showSuccessNotification?: boolean;
  showErrorNotification?: boolean;
}

const useApiHandler = ({
  showSuccess,
  showError,
  showSuccessNotification = true,
  showErrorNotification = true,
}: UseApiHandlerOptions = {}) => {
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);
  const { t } = useTranslation();

  const handleApiCall = useCallback(
    async <T,>(
      apiCall: () => Promise<T>,
      successMessage: unknown = null,
      errorHandler: ApiErrorHandler | null = null,
      rethrowError = false,
    ): Promise<T | null> => {
      if (loadingRef.current) return null;

      loadingRef.current = true;
      setLoading(true);
      try {
        const result = await apiCall();
        if (showSuccessNotification && successMessage && showSuccess) {
          showSuccess(successMessage, t("messages.success"));
        }
        return result;
      } catch (error) {
        if (errorHandler) {
          errorHandler(error);
        } else if (showErrorNotification && showError) {
          HandleApiError(error, (notification) => {
            showError(notification.messages, notification.title);
          });
        }
        if (rethrowError) throw error;
        return null;
      } finally {
        loadingRef.current = false;
        setLoading(false);
      }
    },
    [
      showError,
      showErrorNotification,
      showSuccess,
      showSuccessNotification,
      t,
    ],
  );

  return { loading, handleApiCall, setLoading };
};

export default useApiHandler;
