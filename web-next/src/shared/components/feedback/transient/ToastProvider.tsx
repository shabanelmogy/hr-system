"use client";

import type { CSSProperties, ReactNode } from "react";
import { alpha, useTheme } from "@mui/material/styles";
import { Toaster } from "react-hot-toast";
import type { DefaultToastOptions, ToastPosition } from "react-hot-toast";
import { ErrorDialogHost } from "./error-dialog/ErrorDialogHost";

export interface ToastProviderProps {
  children: ReactNode;
  position?: ToastPosition;
  reverseOrder?: boolean;
  gutter?: number;
  containerClassName?: string;
  containerStyle?: CSSProperties;
  toastOptions?: DefaultToastOptions;
}

export function ToastProvider({
  children,
  position,
  reverseOrder = false,
  gutter = 10,
  containerClassName,
  containerStyle,
  toastOptions,
}: ToastProviderProps) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const baseStyle: CSSProperties = {
    borderRadius: 8,
    minWidth: 280,
    maxWidth: "min(420px, calc(100vw - 32px))",
    padding: "13px 16px",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: 1.45,
    background: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${alpha(theme.palette.divider, isDark ? 0.7 : 0.85)}`,
    boxShadow: isDark
      ? "0 12px 30px rgba(0,0,0,0.5)"
      : "0 12px 30px rgba(15,23,42,0.14)",
    ...toastOptions?.style,
  };
  const themedOptions: DefaultToastOptions = {
    duration: 4_500,
    ...toastOptions,
    style: baseStyle,
    success: mergeVariantOptions(
      baseStyle,
      theme.palette.success.main,
      toastOptions?.success,
    ),
    error: mergeVariantOptions(
      baseStyle,
      theme.palette.error.main,
      toastOptions?.error,
    ),
    loading: mergeVariantOptions(
      baseStyle,
      theme.palette.info.main,
      toastOptions?.loading,
      Infinity,
    ),
    blank: {
      ...toastOptions?.blank,
      style: { ...baseStyle, ...toastOptions?.blank?.style },
    },
  };

  return (
    <>
      {children}
      <Toaster
        position={position ?? (theme.direction === "rtl" ? "top-left" : "top-right")}
        reverseOrder={reverseOrder}
        gutter={gutter}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        toastOptions={themedOptions}
      />
      <ErrorDialogHost />
    </>
  );
}

function mergeVariantOptions(
  baseStyle: CSSProperties,
  accent: string,
  options: DefaultToastOptions["success"],
  duration?: number,
): NonNullable<DefaultToastOptions["success"]> {
  return {
    duration,
    ...options,
    style: {
      ...baseStyle,
      borderInlineStart: `4px solid ${accent}`,
      ...options?.style,
    },
  };
}
