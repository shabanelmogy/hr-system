import { InputAdornment } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import dayjs, { type Dayjs } from "dayjs";
import type { ReactNode } from "react";

export interface MyDateTimeFieldProps {
  fieldName: string;
  label: ReactNode;
  value?: string | null;
  onChange: (value: string) => void;
  onBlur?: () => void;
  mode?: "date" | "date-time";
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: ReactNode;
  minDate?: Dayjs;
  minDateTime?: Dayjs;
  disablePast?: boolean;
  ampm?: boolean;
  format?: string;
  icon?: ReactNode;
}

export default function MyDateTimeField({
  fieldName,
  label,
  value,
  onChange,
  onBlur,
  mode = "date-time",
  disabled = false,
  required = false,
  error = false,
  helperText,
  minDate,
  minDateTime,
  disablePast = false,
  ampm = false,
  format = mode === "date" ? "DD/MM/YYYY" : "DD/MM/YYYY HH:mm",
  icon,
}: MyDateTimeFieldProps) {
  const parsedValue = value ? dayjs(value) : null;
  const pickerValue = parsedValue?.isValid() ? parsedValue : null;
  const textFieldProps = {
    fullWidth: true,
    size: "small" as const,
    required,
    error,
    helperText,
    onBlur,
    slotProps: {
      htmlInput: {
        "aria-required": required || undefined,
        "aria-invalid": error,
        "aria-describedby": helperText ? `${fieldName}-error` : undefined,
      },
      input: icon ? { startAdornment: <InputAdornment position="start">{icon}</InputAdornment> } : undefined,
      formHelperText: { id: `${fieldName}-error` },
    },
    sx: {
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        transition: "all 0.2s",
      },
      "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
        borderWidth: "1px",
      },
    },
  };

  if (mode === "date") {
    return (
      <DatePicker
        label={label}
        value={pickerValue}
        onChange={(nextValue) => onChange(nextValue?.format("YYYY-MM-DD") ?? "")}
        disabled={disabled}
        minDate={minDate}
        disablePast={disablePast}
        format={format}
        slotProps={{ textField: textFieldProps }}
      />
    );
  }

  return (
    <DateTimePicker
      label={label}
      value={pickerValue}
      onChange={(nextValue) => onChange(nextValue?.toISOString() ?? "")}
      disabled={disabled}
      minDateTime={minDateTime}
      disablePast={disablePast}
      ampm={ampm}
      format={format}
      slotProps={{ textField: textFieldProps }}
    />
  );
}
