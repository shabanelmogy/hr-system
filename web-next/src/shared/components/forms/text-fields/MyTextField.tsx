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
import {
  getCharacterLimit,
  getInputConstraints,
} from "./internals/inputConstraints";
import { mergeRefs } from "./internals/refUtils";
import type { MyTextFieldProps, RegisteredField } from "./internals/types";
import { getFormFieldError } from "./formFieldError";
import { useAppReadOnly } from "@/shared/contexts/AppReadOnlyContext";

export default function MyTextField({
  fieldName = "search",
  labelKey = "search",
  label,
  type = "text",
  margin = "normal",
  multiline = false,
  rows,
  loading = false,
  hidden = false,
  name,
  flex,
  containerSx,
  register,
  control,
  inputRef,
  errors = {},
  minValue,
  maxValue,
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
  counter,
  showCounter: showCounterProp,
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
  const { isReadOnly: appIsReadOnly } = useAppReadOnly();
  const effectiveReadOnly = readOnly || (
    appIsReadOnly && (Boolean(control) || required || Boolean(name))
  );
  const actualFieldName = name || fieldName;
  const actualLabel = label || (labelKey ? t(labelKey) : "");
  const isPasswordField = type === "password";
  const fieldError = getFormFieldError(errors, actualFieldName);
  const externalError = Boolean(restProps.error);
  const externalHelperText = restProps.helperText as React.ReactNode;
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

  const characterLimit = useMemo(
    () => getCharacterLimit(type, maxLength, maxValue),
    [maxLength, maxValue, type],
  );
  const showCounter = counter ?? showCounterProp ?? characterLimit != null;
  const countOptions = useMemo(
    () => ({ maxLength: characterLimit, normalColor, warningColor, errorColor, warningThreshold, errorThreshold }),
    [characterLimit, errorColor, errorThreshold, normalColor, warningColor, warningThreshold],
  );
  const inputConstraints = useMemo(
    () => getInputConstraints(type, minValue, maxValue),
    [maxValue, minValue, type],
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
    if (characterLimit != null && nextValue.length > characterLimit) return;
    setRegisterValue(nextValue);
    registeredField?.onChange?.(event);
    externalOnChange?.(event);
  }, [characterLimit, externalOnChange, preventZero, registeredField]);

  const getCommonProps = useCallback((fieldValue: string, onClear: () => void) => {
    const characterCount = getCharacterCount(fieldValue, countOptions);
    const counterText = formatCharacterCount(characterCount, characterLimit, counterFormat);
    const {
      sx: customSx,
      onBlur,
      onFocus,
      slotProps: suppliedSlotProps,
      disabled: suppliedDisabled,
      error: _suppliedError,
      helperText: _suppliedHelperText,
      ...textFieldProps
    } = restProps;
    const externalOnFocus = onFocus as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
    const externalOnBlur = onBlur as React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement> | undefined;
    const externalSlots = asRecord(suppliedSlotProps);
    const externalHtmlInput = asRecord(externalSlots.htmlInput);
    const externalInput = asRecord(externalSlots.input);
    const externalInputLabel = asRecord(externalSlots.inputLabel);
    const externalFormHelperText = asRecord(externalSlots.formHelperText);
    const externalHtmlStyle = asRecord(externalHtmlInput.style);
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
      disabled: loading || Boolean(suppliedDisabled),
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
        ...externalSlots,
        htmlInput: {
          ...externalHtmlInput,
          ...inputConstraints,
          ...(characterLimit != null && { maxLength: characterLimit }),
          "aria-autocomplete": externalHtmlInput["aria-autocomplete"] ?? "none",
          "data-lpignore": "true",
          "data-form-type": "other",
          ...(isPasswordField && {
            style: {
              ...externalHtmlStyle,
              WebkitTextSecurity: showPassword ? "none" : "disc",
            },
          }),
          ...(required && { "aria-required": true }),
          "aria-invalid": Boolean(fieldError) || externalError,
          "aria-describedby": [
            externalHtmlInput["aria-describedby"],
            showCounter && !isPasswordField ? `${actualFieldName}-counter` : null,
            fieldError || externalError || externalHelperText
              ? `${actualFieldName}-error`
              : null,
          ].filter(Boolean).join(" ") || undefined,
        },
        input: {
          ...externalInput,
          startAdornment: startIcon
            ? <InputAdornment position="start">{startIcon}</InputAdornment>
            : externalInput.startAdornment,
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
              customAdornment={endAdornment ?? externalInput.endAdornment as React.ReactNode}
              appearance={appearance}
              clearButtonAriaLabel={clearButtonAriaLabel}
              onClear={onClear}
              onTogglePassword={() => setShowPassword((current: boolean) => !current)}
            />
          ),
        },
        inputLabel: {
          ...externalInputLabel,
          ...(
            type === "date" ||
            (appearance === "plain" && (Boolean(fieldValue) || inputFocused))
              ? { shrink: true }
              : {}
          ),
        },
        formHelperText: {
          ...externalFormHelperText,
          id: `${actualFieldName}-error`,
        },
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
  }, [actualFieldName, actualLabel, appearance, characterLimit, clearButtonAriaLabel, countOptions, counterFormat, endAdornment, externalError, externalHelperText, fieldError, flex, inputConstraints, inputFocused, isPasswordField, loading, margin, multiline, required, restProps, rows, setShowPassword, showClearButton, showCounter, showPassword, showPasswordToggle, startIcon, theme, type]);

  if (hidden) return null;
  if (effectiveReadOnly) {
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
    <Box sx={{ width: "100%", ...asRecord(containerSx) }}>
      <EditableTextField
        control={control}
        name={actualFieldName}
        inputRef={combinedInputRef}
        registeredField={registeredField}
        registerValue={displayedRegisterValue}
        value={value}
        error={Boolean(fieldError) || externalError}
        helperText={fieldError?.message ?? externalHelperText}
        preventZero={preventZero}
        maxLength={characterLimit}
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

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}
