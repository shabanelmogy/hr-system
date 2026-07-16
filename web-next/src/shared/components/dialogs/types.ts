import type { ReactNode } from "react";

export interface MyDialogProps {
  open: boolean;
  onClose: () => void;
  title: string | ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
  showActions?: boolean;
  showCloseButton?: boolean;
  maxWidth?: "xs" | "sm" | "md" | "lg" | "xl" | false;
  fullWidth?: boolean;
  slotProps?: any;
  paperProps?: any;
  [key: string]: any;
}
