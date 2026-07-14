import React, { useCallback, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import ClearIcon from "@mui/icons-material/Clear";
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";

const assignRef = (ref, value) => {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(value);
  } else {
    ref.current = value;
  }
};

const mergeRefs = (...refs) => (value) => {
  refs.forEach((ref) => assignRef(ref, value));
};

const MyTextField = ({
  fieldName = "search",
  labelKey = "search",
  label = undefined,
  type = "text",
  margin = "normal",
  multiline = false,
  rows = 1,
  loading = false,
  hidden = false,
  name = undefined,
  flex = undefined,
  register = undefined,
  control = undefined,
  inputRef = undefined,
  errors = {},
  maxLength = undefined,
  preventZero = false,
  watch = undefined,
  setValue = undefined,
  startIcon = undefined,
  endAdornment = undefined,
  showClearButton = true,
  showPasswordToggle = true,
  showPassword: externalShowPassword = undefined,
  setShowPassword: externalSetShowPassword = undefined,
  readOnly = false,
  value = undefined,
  showCounter = true,
  counterLabel = undefined,
  counterFormat = "fraction",
  warningThreshold = 70,
  errorThreshold = 90,
  normalColor = "primary",
  warningColor = "warning",
  errorColor = "error",
  ...restProps
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const actualFieldName = name || fieldName;
  const actualLabel = label || (labelKey ? t(labelKey) : "");
  const isPasswordField = type === "password";
  const registeredField = useMemo(
    () => (typeof register === "function" ? register(actualFieldName) : register),
    [actualFieldName, register],
  );

  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const [registerValue, setRegisterValue] = useState("");
  const showPassword =
    externalShowPassword !== undefined
      ? externalShowPassword
      : internalShowPassword;
  const setShowPassword = externalSetShowPassword || setInternalShowPassword;
  const watchedValue = watch ? watch(actualFieldName) : undefined;
  const registerFieldValue = String(
    value !== undefined ? value : watchedValue ?? registerValue ?? "",
  );

  const getCharacterCount = useCallback(
    (fieldValue) => {
      const count = String(fieldValue ?? "").length;
      if (maxLength == null) {
        return {
          count,
          percentage: 0,
          color: normalColor,
          remaining: undefined,
          isWarning: false,
          isError: false,
          isAtLimit: false,
        };
      }

      const percentage = maxLength === 0 ? 100 : (count / maxLength) * 100;
      let color = normalColor;
      if (percentage > errorThreshold) color = errorColor;
      else if (percentage > warningThreshold) color = warningColor;

      return {
        count,
        percentage,
        color,
        remaining: maxLength - count,
        isWarning: percentage > warningThreshold,
        isError: percentage > errorThreshold,
        isAtLimit: count >= maxLength,
      };
    },
    [errorColor, errorThreshold, maxLength, normalColor, warningColor, warningThreshold],
  );

  const formatCounterText = useCallback(
    (counterData) => {
      if (maxLength == null) return `${counterData.count}`;
      switch (counterFormat) {
        case "remaining":
          return `${counterData.remaining} remaining`;
        case "percentage":
          return `${Math.round(counterData.percentage)}%`;
        case "fraction":
        default:
          return `${counterData.count}/${maxLength}`;
      }
    },
    [counterFormat, maxLength],
  );

  const handleClear = useCallback(
    (controllerOnChange = undefined) => {
      if (controllerOnChange) {
        controllerOnChange("");
        return;
      }

      if (setValue) {
        setValue(actualFieldName, "", {
          shouldValidate: true,
          shouldDirty: true,
          shouldTouch: true,
        });
      } else {
        registeredField?.onChange?.({
          target: { name: actualFieldName, value: "" },
          type: "change",
        });
      }

      setRegisterValue("");
    },
    [actualFieldName, registeredField, setValue],
  );

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword((current) => !current);
  }, [setShowPassword]);

  const renderEndAdornment = useCallback(
    (fieldValue, onClear) => {
      const normalizedValue = String(fieldValue ?? "");
      const counterData = getCharacterCount(normalizedValue);
      const elements = [];

      if (showCounter && !isPasswordField) {
        elements.push(
          <Typography
            key="counter"
            id={`${actualFieldName}-counter`}
            variant="caption"
            sx={{
              fontWeight: 500,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: `${theme.palette[counterData.color].main}15`,
              color: counterData.color,
              transition: "all 0.2s ease-in-out",
              fontSize: "0.75rem",
              mr: 1,
              userSelect: "none",
              pointerEvents: "none",
            }}
            aria-live="polite"
            aria-label={`Character count: ${formatCounterText(counterData)}`}
          >
            {formatCounterText(counterData)}
          </Typography>,
        );
      }

      if (normalizedValue && showClearButton && type !== "date") {
        elements.push(
          <IconButton
            key="clear"
            aria-label={`Clear ${actualFieldName}`}
            onClick={onClear}
            disabled={loading}
            edge="end"
            size="small"
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ClearIcon fontSize="small" />
          </IconButton>,
        );
      }

      if (isPasswordField && showPasswordToggle && normalizedValue) {
        elements.push(
          <IconButton
            key="password-toggle"
            onClick={handleTogglePasswordVisibility}
            edge="end"
            size="small"
            disabled={loading}
            aria-label={
              showPassword
                ? t("hidePassword", { field: actualFieldName }) || "Hide password"
                : t("showPassword", { field: actualFieldName }) || "Show password"
            }
            sx={{
              color: "text.secondary",
              "&:hover": {
                color: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            {showPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>,
        );
      }

      if (endAdornment) {
        elements.push(
          <React.Fragment key="custom-endAdornment">{endAdornment}</React.Fragment>,
        );
      }

      return elements.length > 0 ? (
        <InputAdornment position="end">{elements}</InputAdornment>
      ) : null;
    },
    [
      actualFieldName,
      endAdornment,
      formatCounterText,
      getCharacterCount,
      handleTogglePasswordVisibility,
      isPasswordField,
      loading,
      showClearButton,
      showCounter,
      showPassword,
      showPasswordToggle,
      t,
      theme,
      type,
    ],
  );

  const handleRegisterChange = useCallback(
    (event) => {
      const nextValue = String(event.target.value ?? "");
      if (preventZero && nextValue === "0") return;
      if (maxLength != null && nextValue.length > maxLength) return;

      setRegisterValue(nextValue);
      registeredField?.onChange?.(event);
    },
    [maxLength, preventZero, registeredField],
  );

  const handleFocus = useCallback(
    (event) => {
      restProps.onFocus?.(event);
    },
    [restProps],
  );

  const getCommonTextFieldProps = useCallback(
    (fieldValue, onClear) => ({
      label: actualLabel,
      type: isPasswordField ? (showPassword ? "text" : "password") : type,
      margin: margin as "normal" | "none" | "dense",
      variant: "outlined" as const,
      fullWidth: true,
      multiline,
      rows,
      disabled: loading,
      autoComplete: isPasswordField ? "new-password" : "off",
      slotProps: {
        htmlInput: {
          ...(maxLength != null && { maxLength }),
          ...(type === "number" && { min: 0 }),
          "aria-autocomplete": "none",
          "data-lpignore": "true",
          "data-form-type": "other",
          "aria-describedby": showCounter
            ? `${actualFieldName}-counter`
            : undefined,
          ...(isPasswordField && {
            style: {
              WebkitTextSecurity: showPassword ? "none" : "disc",
            },
          }),
        },
        input: {
          startAdornment: startIcon ? (
            <InputAdornment position="start">{startIcon}</InputAdornment>
          ) : null,
          endAdornment: renderEndAdornment(fieldValue, onClear),
        },
        inputLabel: {
          ...(type === "date" && { shrink: true }),
        },
      },
      sx: {
        flex,
        "& .MuiOutlinedInput-root": {
          borderRadius: 2,
          transition: "all 0.2s",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: "1px",
          },
        },
        ...(isPasswordField && {
          "& input:-webkit-autofill": {
            WebkitBoxShadow: `0 0 0 100px ${
              theme.palette.mode === "dark"
                ? "rgb(30, 30, 30)"
                : theme.palette.background.default
            } inset !important`,
          },
          "& input[type='password']::-ms-reveal": { display: "none" },
          "& input[type='password']::-webkit-credentials-auto-fill-button": {
            display: "none !important",
          },
          "& input[type='password']::-webkit-strong-password-auto-fill-button": {
            display: "none !important",
          },
        }),
        ...(type === "date" && {
          "& input[type='date']::-webkit-calendar-picker-indicator": {
            filter: "invert(25%) sepia(100%) saturate(500%) hue-rotate(200deg)",
          },
        }),
        ...restProps.sx,
      },
      onFocus: handleFocus,
      ...restProps,
    }),
    [
      actualFieldName,
      actualLabel,
      flex,
      handleFocus,
      isPasswordField,
      loading,
      margin,
      maxLength,
      multiline,
      renderEndAdornment,
      restProps,
      rows,
      showCounter,
      showPassword,
      startIcon,
      theme,
      type,
    ],
  );

  if (hidden) return null;

  if (readOnly) {
    const renderReadOnly = (displayValue) => (
      <Box sx={{ width: "100%", mb: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={2}>
          <Typography
            variant="subtitle2"
            sx={{ color: "info.light", minWidth: 120, fontWeight: "bold" }}
          >
            {actualLabel}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: (currentTheme) =>
                currentTheme.palette.mode === "dark"
                  ? alpha(currentTheme.palette.primary.main, 0.08)
                  : alpha(currentTheme.palette.info.light, 0.08),
              color: "text.primary",
              flexGrow: 1,
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              border: (currentTheme) =>
                `1px solid ${alpha(currentTheme.palette.info.light, 0.2)}`,
            }}
          >
            {type === "password"
              ? displayValue
                ? "••••••••••"
                : "-"
              : displayValue ?? "-"}
          </Typography>
        </Stack>
      </Box>
    );

    if (control) {
      return (
        <Controller
          name={actualFieldName}
          control={control}
          render={({ field }) => renderReadOnly(value !== undefined ? value : field.value)}
        />
      );
    }

    return renderReadOnly(value !== undefined ? value : watch?.(actualFieldName));
  }

  const fieldError = errors?.[actualFieldName];
  const helperText = fieldError?.message;

  const renderTextField = () => {
    if (control) {
      return (
        <Controller
          name={actualFieldName}
          control={control}
          render={({ field }) => {
            const fieldValue = String(field.value ?? "");
            const commonProps = getCommonTextFieldProps(
              fieldValue,
              () => handleClear(field.onChange),
            );
            return (
              <TextField
                {...commonProps}
                {...field}
                inputRef={mergeRefs(field.ref, inputRef)}
                error={!!fieldError}
                helperText={helperText}
                onChange={(event) => {
                  const nextValue = String(event.target.value ?? "");
                  if (preventZero && nextValue === "0") return;
                  if (maxLength != null && nextValue.length > maxLength) return;
                  field.onChange(nextValue);
                }}
              />
            );
          }}
        />
      );
    }

    const commonProps = getCommonTextFieldProps(
      registerFieldValue,
      () => handleClear(),
    );
    return (
      <TextField
        {...commonProps}
        {...registeredField}
        inputRef={mergeRefs(registeredField?.ref, inputRef)}
        value={value !== undefined ? value : undefined}
        error={!!fieldError}
        helperText={helperText}
        onChange={handleRegisterChange}
      />
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {renderTextField()}
      {showCounter && !isPasswordField && counterLabel && (
        <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 0.5, px: 1 }}>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {counterLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyTextField;
