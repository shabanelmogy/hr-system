import {
  InfoOutlined as InfoIcon,
  WarningAmberRounded as WarningIcon,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import type { ToastOptions } from "react-hot-toast";
import { showErrorDialog } from "./error-dialog/errorDialogStore";

const DEFAULT_DURATION = 4_500;
const baseOptions: ToastOptions = { duration: DEFAULT_DURATION };
const loadingOptions: ToastOptions = { duration: Infinity };

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...baseOptions, ...options }),

  error: (error: unknown) => {
    showErrorDialog(error);
    return "error-dialog";
  },

  warning: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...baseOptions,
      ...options,
      icon: <WarningIcon color="warning" />,
    }),

  info: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...baseOptions,
      ...options,
      icon: <InfoIcon color="info" />,
    }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, { ...loadingOptions, ...options }),

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
    options?: ToastOptions,
  ) => {
    const toastId = toast.loading(messages.loading, { ...loadingOptions, ...options });

    return promise.then(
      (data) => {
        const message =
          typeof messages.success === "function" ? messages.success(data) : messages.success;
        toast.success(message, { ...baseOptions, ...options, id: toastId });
        return data;
      },
      (error: unknown) => {
        toast.dismiss(toastId);
        const title =
          typeof messages.error === "function" ? messages.error(error) : messages.error;
        showErrorDialog(error, title);
        throw error;
      },
    );
  },

  custom: (message: string, options?: ToastOptions) =>
    toast(message, { ...baseOptions, ...options }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),
  remove: (toastId?: string) => toast.remove(toastId),
};

export default showToast;
