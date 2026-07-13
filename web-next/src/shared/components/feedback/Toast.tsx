"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { alpha, useTheme } from "@mui/material/styles";
import type { CSSProperties, ReactNode } from "react";
import toast, {
  Toaster,
  type DefaultToastOptions,
  type ToastOptions,
} from "react-hot-toast";
import {
  ErrorDialogHost,
  showErrorDialog,
  type ErrorDialogDetails,
} from "./ErrorDialog";

const defaultToastOptions: ToastOptions = {
  duration: 4500,
  position: "top-right",
  style: {
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 600,
    lineHeight: 1.45,
    padding: "13px 16px",
    minWidth: "280px",
    maxWidth: "min(420px, calc(100vw - 32px))",
  },
};

const getMode = (): "dark" | "light" => {
  try {
    const stored =
      typeof localStorage !== "undefined"
        ? localStorage.getItem("currentMode")
        : null;
    if (stored === "dark" || stored === "light") return stored;
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }

  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  return "light";
};

const getStaticToastStyle = (accent: string): CSSProperties => {
  const dark = getMode() === "dark";
  return {
    ...defaultToastOptions.style,
    background: dark ? "#1e1e1e" : "#ffffff",
    color: dark ? "#f5f5f5" : "#1f2937",
    border: `1px solid ${dark ? "#3f3f46" : "#e5e7eb"}`,
    borderInlineStart: `4px solid ${accent}`,
    boxShadow: dark
      ? "0 12px 30px rgba(0,0,0,0.45)"
      : "0 12px 30px rgba(15,23,42,0.14)",
  };
};

const loadingOptions: ToastOptions = {
  ...defaultToastOptions,
  duration: Infinity,
};

type ErrorInput = string | string[] | Error | ErrorDialogDetails | unknown;

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultToastOptions, ...options }),

  error: (error: ErrorInput, options?: ToastOptions) => {
    void options;
    showErrorDialog(error);
    return "error-dialog";
  },

  warning: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...defaultToastOptions,
      ...options,
      icon: <WarningAmberRoundedIcon sx={{ color: "#f59e0b" }} />,
      style: {
        ...getStaticToastStyle("#f59e0b"),
        ...options?.style,
      },
    }),

  info: (message: string, options?: ToastOptions) =>
    toast(message, {
      ...defaultToastOptions,
      ...options,
      icon: <InfoOutlinedIcon sx={{ color: "#0284c7" }} />,
      style: {
        ...getStaticToastStyle("#0284c7"),
        ...options?.style,
      },
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
    const toastId = toast.loading(messages.loading, {
      ...loadingOptions,
      ...options,
    });

    return promise.then(
      (data) => {
        const message =
          typeof messages.success === "function"
            ? messages.success(data)
            : messages.success;
        toast.success(message, { ...defaultToastOptions, ...options, id: toastId });
        return data;
      },
      (error: unknown) => {
        toast.dismiss(toastId);
        const fallbackTitle =
          typeof messages.error === "function"
            ? messages.error(error)
            : messages.error;
        showErrorDialog(error, fallbackTitle);
        throw error;
      },
    );
  },

  custom: (message: string, options?: ToastOptions) =>
    toast(message, { ...defaultToastOptions, ...options }),

  dismiss: (toastId?: string) => toast.dismiss(toastId),
  remove: (toastId?: string) => toast.remove(toastId),
};

interface ToastProviderProps {
  children: ReactNode;
  position?:
    | "top-left"
    | "top-center"
    | "top-right"
    | "bottom-left"
    | "bottom-center"
    | "bottom-right";
  reverseOrder?: boolean;
  gutter?: number;
  containerClassName?: string;
  containerStyle?: CSSProperties;
  toastOptions?: ToastOptions;
}

export function ToastProvider({
  children,
  position = "top-right",
  reverseOrder = false,
  gutter = 10,
  containerClassName,
  containerStyle,
  toastOptions,
}: ToastProviderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const baseBorder = alpha(theme.palette.divider, isDark ? 0.7 : 0.85);
  const baseStyle: CSSProperties = {
    ...defaultToastOptions.style,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${baseBorder}`,
    boxShadow: isDark
      ? "0 12px 30px rgba(0,0,0,0.5)"
      : "0 12px 30px rgba(15,23,42,0.14)",
  };

  const themedToastOptions: DefaultToastOptions = {
    ...defaultToastOptions,
    style: baseStyle,
    success: {
      iconTheme: {
        primary: theme.palette.success.main,
        secondary: theme.palette.background.paper,
      },
      style: {
        ...baseStyle,
        borderInlineStart: `4px solid ${theme.palette.success.main}`,
      },
    },
    error: {
      iconTheme: {
        primary: theme.palette.error.main,
        secondary: theme.palette.background.paper,
      },
      style: {
        ...baseStyle,
        borderInlineStart: `4px solid ${theme.palette.error.main}`,
      },
    },
    loading: {
      duration: Infinity,
      style: {
        ...baseStyle,
        borderInlineStart: `4px solid ${theme.palette.info.main}`,
      },
    },
    blank: { style: baseStyle },
  };

  return (
    <>
      {children}
      <Toaster
        position={position}
        reverseOrder={reverseOrder}
        gutter={gutter}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        toastOptions={{
          ...themedToastOptions,
          ...toastOptions,
        }}
      />
      <ErrorDialogHost />
    </>
  );
}

export const useToast = () => ({
  success: showToast.success,
  error: showToast.error,
  warning: showToast.warning,
  info: showToast.info,
  loading: showToast.loading,
  promise: showToast.promise,
  custom: showToast.custom,
  dismiss: showToast.dismiss,
  remove: showToast.remove,
});

export { toast };

export default showToast;
