import { Box, InputAdornment, Typography, useTheme } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EditableTextField from "./internals/EditableTextField";
import {
  formatCharacterCount,
  getCharacterCount,
} from "./internals/characterCount";
import ReadOnlyTextField from "./internals/ReadOnlyTextField";
import TextFieldEndAdornment from "./internals/TextFieldEndAdornment";
import { mergeRefs } from "./internals/refUtils";
import type { MyTextFieldProps, RegisteredField } from "./internals/types";
import { getFormFieldError } from "./formFieldError";

export default function MyTextField({
  fieldName = "search",
  labelKey = "search",
  label,
  type = "text",
  margin = "normal",
  multiline = false,
  rows = 1,
  loading = false,
  hidden = false,
  name,
  flex,
  register,
  control,
  inputRef,
  errors = {},
  maxLength,
  preventZero = false,
  watch,
  setValue,
  startIcon,
  endAdornment,
  showClearButton = true,
  showPasswordToggle = true,
  showPassword: externalShowPassword,
  setShowPassword: externalSetShowPassword,
  readOnly = false,
  value,
  showCounter = true,
  counterLabel,
  counterFormat = "fraction",
  warningThreshold = 70,
  errorThreshold = 90,
  required = false,
  normalColor = "primary",
  warningColor = "warning",
  errorColor = "error",
  appearance = "enhanced",
  clearButtonAriaLabel,
  onClear: externalOnClear,
  ...restProps
}: MyTextFieldProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const actualFieldName = name || fieldName;
  const actualLabel = label || (labelKey ? t(labelKey) : "");
  const isPasswordField = type === "password";
  const fieldError = getFormFieldError(errors, actualFieldName);
  const externalOnChange = restProps.onChange as
    | ((
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => void)
    | undefined;
  const registeredField = useMemo<RegisteredField | undefined>(
    () => typeof register === "function"
      ? (register as (fieldName: string) => RegisteredField)(actualFieldName)
      : register as RegisteredField | undefined,
    [actualFieldName, register],
  );
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const [registerValue, setRegisterValue] = useState("");
  const [inputFocused, setInputFocused] = useState(false);
  const localInputRef = useRef<HTMLInputElement>(null);
  const combinedInputRef = useCallback(
    (element: HTMLInputElement | null) => {
      mergeRefs(localInputRef, inputRef)(element);
    },
    [inputRef],
  );
  const showPassword = externalShowPassword ?? internalShowPassword;
  const setShowPassword = (externalSetShowPassword || setInternalShowPassword) as (
    next: boolean | ((current: boolean) => boolean),
  ) => void;
  const watchedValue = typeof watch === "function"
    ? (watch as (fieldName: string) => unknown)(actualFieldName)
    : undefined;
  const displayedRegisterValue = String(value !== undefined ? value : watchedValue ?? registerValue);

  const countOptions = useMemo(
    () => ({ maxLength, normalColor, warningColor, errorColor, warningThreshold, errorThreshold }),
    [errorColor, errorThreshold, maxLength, normalColor, warningColor, warningThreshold],
  );

  const handleClear = useCallback((controllerOnChange?: (value: string) => void) => {
    if (controllerOnChange) controllerOnChange("");
    else if (typeof setValue === "function") {
      (setValue as (
        fieldName: string,
        value: string,
        options: Record<string, boolean>,
      ) => void)(actualFieldName, "", {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    } else {
      registeredField?.onChange?.({ target: { name: actualFieldName, value: "" }, type: "change" });
    }
    setRegisterValue("");
    if (externalOnClear) externalOnClear();
    else externalOnChange?.(createChangeEvent(actualFieldName, ""));
    localInputRef.current?.focus();
  }, [actualFieldName, externalOnChange, externalOnClear, registeredField, setValue]);

  const handleRegisterChange = useCallback((event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const nextValue = String(event.target.value ?? "");
    if (preventZero && nextValue === "0") return;
    if (maxLength != null && nextValue.length > maxLength) return;
    setRegisterValue(nextValue);
    registeredField?.onChange?.(event);
    externalOnChange?.(event);
  }, [externalOnChange, maxLength, preventZero, registeredField]);

  const getCommonProps = useCallback((fieldValue: string, onClear: () => void) => {
    const characterCount = getCharacterCount(fieldValue, countOptions);
    const counterText = formatCharacterCount(characterCount, maxLength, counterFormat);
    const { sx: customSx, onBlur, onFocus, ...textFieldProps } = restProps;
    const externalOnFocus = onFocus as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
    const externalOnBlur = onBlur as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
    const customStyles = customSx && typeof customSx === "object" && !Array.isArray(customSx)
      ? customSx as Record<string, unknown>
      : {};

    return {
      ...textFieldProps,
      label: actualLabel,
      required,
      type: isPasswordField ? (showPassword ? "text" : "password") : type,
      margin,
      variant: "outlined",
      fullWidth: true,
      multiline,
      rows,
      disabled: loading,
      autoComplete: isPasswordField ? "new-password" : "off",
      onFocus: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (appearance === "plain") setInputFocused(true);
        externalOnFocus?.(event);
      },
      onBlur: (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (appearance === "plain") setInputFocused(false);
        externalOnBlur?.(event);
      },
      slotProps: {
        htmlInput: {
          ...(maxLength != null && { maxLength }),
          ...(type === "number" && { min: 0 }),
          "aria-autocomplete": "none",
          "data-lpignore": "true",
          "data-form-type": "other",
          ...(isPasswordField && { style: { WebkitTextSecurity: showPassword ? "none" : "disc" } }),
          ...(required && { "aria-required": true }),
          "aria-invalid": Boolean(fieldError),
          "aria-describedby": [
            showCounter ? `${actualFieldName}-counter` : null,
            fieldError ? `${actualFieldName}-error` : null,
          ].filter(Boolean).join(" ") || undefined,
        },
        input: {
          startAdornment: startIcon ? <InputAdornment position="start">{startIcon}</InputAdornment> : null,
          endAdornment: (
            <TextFieldEndAdornment
              fieldName={actualFieldName}
              value={fieldValue}
              type={type}
              loading={loading}
              isPassword={isPasswordField}
              showPassword={showPassword}
              showPasswordToggle={showPasswordToggle}
              showClearButton={showClearButton}
              showCounter={showCounter}
              counter={characterCount}
              counterText={counterText}
              customAdornment={endAdornment}
              appearance={appearance}
              clearButtonAriaLabel={clearButtonAriaLabel}
              onClear={onClear}
              onTogglePassword={() => setShowPassword((current: boolean) => !current)}
            />
          ),
        },
        inputLabel:
          type === "date" ||
          (appearance === "plain" && (Boolean(fieldValue) || inputFocused))
            ? { shrink: true }
            : {},
        formHelperText: { id: `${actualFieldName}-error` },
      },
      sx: {
        flex,
        ...(appearance === "plain"
          ? { width: "100%" }
          : {
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                transition: "all 0.2s",
                "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main, borderWidth: "1px" },
              },
            }),
        ...(appearance !== "plain" && isPasswordField && {
          "& input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.mode === "dark" ? "rgb(30, 30, 30)" : theme.palette.background.default} inset !important`,
          },
          "& input[type='password']::-ms-reveal": { display: "none" },
          "& input[type='password']::-webkit-credentials-auto-fill-button": { display: "none !important" },
          "& input[type='password']::-webkit-strong-password-auto-fill-button": { display: "none !important" },
        }),
        ...(appearance !== "plain" && type === "date" && {
          "& input[type='date']::-webkit-calendar-picker-indicator": {
            filter: "invert(25%) sepia(100%) saturate(500%) hue-rotate(200deg)",
          },
        }),
        ...customStyles,
      },
    };
  }, [actualFieldName, actualLabel, appearance, clearButtonAriaLabel, countOptions, counterFormat, endAdornment, fieldError, flex, inputFocused, isPasswordField, loading, margin, maxLength, multiline, required, restProps, rows, setShowPassword, showClearButton, showCounter, showPassword, showPasswordToggle, startIcon, theme, type]);

  if (hidden) return null;
  if (readOnly) {
    return (
      <ReadOnlyTextField
        control={control}
        name={actualFieldName}
        label={actualLabel}
        type={type}
        value={value}
        watch={typeof watch === "function" ? watch as (fieldName: string) => unknown : undefined}
      />
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <EditableTextField
        control={control}
        name={actualFieldName}
        inputRef={combinedInputRef}
        registeredField={registeredField}
        registerValue={displayedRegisterValue}
        value={value}
        fieldError={fieldError}
        helperText={fieldError?.message}
        preventZero={preventZero}
        maxLength={maxLength}
        getCommonProps={getCommonProps}
        onClear={handleClear}
        onRegisterChange={handleRegisterChange}
        onChange={externalOnChange}
      />
      {showCounter && !isPasswordField && counterLabel && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 0.5, px: 1 }}>
          <Typography variant="caption" sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {counterLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
}

function createChangeEvent(name: string, value: string) {
  return {
    target: { name, value },
    currentTarget: { name, value },
    type: "change",
  } as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;
}
