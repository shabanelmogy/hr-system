import { Box, InputAdornment, Typography, useTheme } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import EditableTextField from "./my-text-field/EditableTextField";
import {
  formatCharacterCount,
  getCharacterCount,
} from "./my-text-field/characterCount";
import ReadOnlyTextField from "./my-text-field/ReadOnlyTextField";
import TextFieldEndAdornment from "./my-text-field/TextFieldEndAdornment";
import type { MyTextFieldProps, RegisteredField } from "./my-text-field/types";

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
  ...restProps
}: MyTextFieldProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const actualFieldName = name || fieldName;
  const actualLabel = label || (labelKey ? t(labelKey) : "");
  const isPasswordField = type === "password";
  const fieldError = errors?.[actualFieldName];
  const registeredField = useMemo<RegisteredField | undefined>(
    () => typeof register === "function"
      ? (register as (fieldName: string) => RegisteredField)(actualFieldName)
      : register as RegisteredField | undefined,
    [actualFieldName, register],
  );
  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const [registerValue, setRegisterValue] = useState("");
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
  }, [actualFieldName, registeredField, setValue]);

  const handleRegisterChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = String(event.target.value ?? "");
    if (preventZero && nextValue === "0") return;
    if (maxLength != null && nextValue.length > maxLength) return;
    setRegisterValue(nextValue);
    registeredField?.onChange?.(event);
  }, [maxLength, preventZero, registeredField]);

  const getCommonProps = useCallback((fieldValue: string, onClear: () => void) => {
    const characterCount = getCharacterCount(fieldValue, countOptions);
    const counterText = formatCharacterCount(characterCount, maxLength, counterFormat);
    const { sx: customSx, onFocus, ...textFieldProps } = restProps;
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
      onFocus: onFocus as ((event: React.FocusEvent<HTMLInputElement>) => void) | undefined,
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
              onClear={onClear}
              onTogglePassword={() => setShowPassword((current: boolean) => !current)}
            />
          ),
        },
        inputLabel: type === "date" ? { shrink: true } : {},
        formHelperText: { id: `${actualFieldName}-error` },
      },
      sx: {
        flex,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          transition: "all 0.2s",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main, borderWidth: "1px" },
        },
        ...(isPasswordField && {
          "& input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 100px ${theme.palette.mode === "dark" ? "rgb(30, 30, 30)" : theme.palette.background.default} inset !important`,
          },
          "& input[type='password']::-ms-reveal": { display: "none" },
          "& input[type='password']::-webkit-credentials-auto-fill-button": { display: "none !important" },
          "& input[type='password']::-webkit-strong-password-auto-fill-button": { display: "none !important" },
        }),
        ...(type === "date" && {
          "& input[type='date']::-webkit-calendar-picker-indicator": {
            filter: "invert(25%) sepia(100%) saturate(500%) hue-rotate(200deg)",
          },
        }),
        ...customStyles,
      },
    };
  }, [actualFieldName, actualLabel, countOptions, counterFormat, endAdornment, fieldError, flex, isPasswordField, loading, margin, maxLength, multiline, required, restProps, rows, setShowPassword, showClearButton, showCounter, showPassword, showPasswordToggle, startIcon, theme, type]);

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
        inputRef={inputRef}
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
