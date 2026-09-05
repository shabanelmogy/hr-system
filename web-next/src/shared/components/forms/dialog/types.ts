import type { ReactNode } from "react";

export interface MockDataAction {
  onGenerate: () => void;
  disabled?: boolean;
}

export interface MyFormProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  submitButtonText?: string;
  onSubmit?: (event?: React.FormEvent) => void | Promise<void>;
  children?: ReactNode;
  isSubmitting?: boolean;
  /** Blocks the primary mutation while prerequisite data is unavailable. */
  submitDisabled?: boolean;
  /** Prevents accidental dismissal and disables unchanged saves when supplied. */
  isDirty?: boolean;
  icon?: ReactNode;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  variant?: "default" | "modern" | "glassmorphic";
  maxHeight?: string;
  hideFooter?: boolean;
  recordId?: string | number | null;
  isViewMode?: boolean;
  focusFieldName?: string | null;
  autoFocusFirst?: boolean;
  overlayActionType?: string | null;
  overlayMessage?: string | null;
  errors?: Record<string, string>;
  onErrorFound?: (errorField: string, fieldElement: HTMLElement) => void;
  footerLeft?: ReactNode;
  /** Development-only action that fills the form without submitting it. */
  mockDataAction?: MockDataAction;
}
