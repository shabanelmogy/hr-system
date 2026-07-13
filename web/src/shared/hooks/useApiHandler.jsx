// hooks/useApiHandler.js
import { HandleApiError } from "@/shared/services";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

const useApiHandler = (options = {}) => {
  const {
    showSuccess,
    showError,
    showSuccessNotification = true,
    showErrorNotification = true,
  } = options;

  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleApiCall = useCallback(
    async (apiCall, successMessage = null, errorHandler = null) => {
      if (loading) return null;

      setLoading(true);
      try {
        const result = await apiCall();

        // Show success notification if enabled and message provided
        if (showSuccessNotification && successMessage && showSuccess) {
          showSuccess([successMessage], t("messages.success"));
        }

        return result;
      } catch (error) {
        // Use custom error handler if provided
        if (errorHandler) {
          errorHandler(error);
        } else if (showErrorNotification && showError) {
          // Default error handling
          HandleApiError(error, (updatedState) => {
            showError(updatedState.messages, error.title);
          });
        }
      } finally {
        setLoading(false);
      }
    },
    [
      loading,
      showSuccess,
      showError,
      showSuccessNotification,
      showErrorNotification,
      t,
    ]
  );

  return {
    loading,
    handleApiCall,
    setLoading, // Expose setLoading in case manual control is needed
  };
};

export default useApiHandler;
