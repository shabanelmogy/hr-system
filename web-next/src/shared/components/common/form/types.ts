import type { ReactNode } from "react";

export interface MyFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  submitButtonText?: string;
  onSubmit: (event?: any) => void;
  children?: ReactNode;
  isSubmitting?: boolean;
  icon?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  variant?: "default" | "modern" | "glassmorphic";
  maxHeight?: string;
  hideFooter?: boolean;
  recordId?: any;
  isViewMode?: boolean;
  focusFieldName?: string | null;
  autoFocusFirst?: boolean;
  overlayActionType?: string | null;
  overlayMessage?: string | null;
  errors?: Record<string, string>;
  onErrorFound?: (errorField: string, fieldElement?: any) => void;
  footerLeft?: ReactNode;
}
