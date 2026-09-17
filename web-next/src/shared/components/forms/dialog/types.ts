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
  /**
   * Submission adapters may return framework-specific values (for example
   * React Hook Form's Promise<unknown>). The dialog only awaits completion and
   * never consumes the resolved value.
   */
  onSubmit?: (event?: React.FormEvent) => unknown | Promise<unknown>;
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
  /** Human-readable labels used by the validation error summary. */
  errorLabels?: Record<string, string>;
  onErrorFound?: (errorField: string, fieldElement: HTMLElement) => void;
  footerLeft?: ReactNode;
  /** Development-only action that fills the form without submitting it. */
  mockDataAction?: MockDataAction;
}
