import type { ReactNode, Ref } from "react";

export type RegisteredField = {
  name?: string;
  ref?: Ref<HTMLInputElement>;
  onChange?: (event: unknown) => void;
  onBlur?: (event: unknown) => void;
  [key: string]: unknown;
};

export type FieldErrorLike = {
  message?: ReactNode;
};

export type MyTextFieldProps = {
  fieldName?: string;
  labelKey?: string | null;
  label?: ReactNode;
  type?: string;
  margin?: "normal" | "none" | "dense";
  multiline?: boolean;
  rows?: number;
  loading?: boolean;
  hidden?: boolean;
  name?: string;
  flex?: unknown;
  register?: unknown;
  control?: unknown;
  inputRef?: Ref<HTMLInputElement>;
  errors?: Record<string, FieldErrorLike | undefined>;
  maxLength?: number;
  preventZero?: boolean;
  watch?: unknown;
  setValue?: unknown;
  startIcon?: ReactNode;
  endAdornment?: ReactNode;
  showClearButton?: boolean;
  showPasswordToggle?: boolean;
  showPassword?: boolean;
  setShowPassword?: unknown;
  readOnly?: boolean;
  value?: unknown;
  showCounter?: boolean;
  counterLabel?: ReactNode;
  counterFormat?: "remaining" | "percentage" | "fraction";
  warningThreshold?: number;
  errorThreshold?: number;
  required?: boolean;
  normalColor?: string;
  warningColor?: string;
  errorColor?: string;
  [key: string]: unknown;
};
