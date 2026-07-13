/* eslint-disable react/prop-types */
import React from "react";
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
import { useCallback, useEffect, useState } from "react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";

const MyTextField = ({
  // Core Props
  fieldName = "search",
  labelKey = "search",
  label = undefined, // Alternative to labelKey for direct label
  type = "text", // 'text' | 'password' | 'email' | 'number' | 'date' | etc.
  margin = "normal",
  multiline = false,
  rows = 1,
  loading = false,
  hidden = false,
  name = undefined, // Alternative to fieldName for compatibility
  flex = undefined,

  // Form Integration - Support both react-hook-form patterns
  register = undefined, // For register pattern
  control = undefined, // For Controller pattern
  inputRef = undefined,
  errors = {},
  maxLength = 50,
  preventZero = false,
  watch = undefined,
  setValue = undefined,

  // UI Elements
  startIcon = undefined,
  endAdornment = undefined, // Custom end adornment
  showClearButton = true,
  showPasswordToggle = true,

  // Password-specific props
  showPassword: externalShowPassword = undefined,
  setShowPassword: externalSetShowPassword = undefined,

  // View/Edit Mode (NEW FEATURE)
  readOnly = false, // Control if field is in read-only view mode
  value = undefined, // Value to display in read-only mode

  // Character Counter
  showCounter = true,
  counterLabel = undefined,
  counterFormat = "fraction", // 'fraction' | 'remaining' | 'percentage'
  warningThreshold = 70,
  errorThreshold = 90,
  normalColor = "primary",
  warningColor = "warning",
  errorColor = "error",

  // Additional Props
  ...restProps
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // ==========================================
  // COMPATIBILITY LAYER
  // ==========================================
  const actualFieldName = name || fieldName;
  const actualLabel = label || (labelKey ? t(labelKey) : "");

  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [showClear, setShowClear] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [controllerField, setControllerField] = useState(null);

  // Internal password visibility state
  const [internalShowPassword, setInternalShowPassword] = useState(false);

  // Determine password visibility state
  const isPasswordField = type === "password";
  const showPassword =
    externalShowPassword !== undefined
      ? externalShowPassword
      : internalShowPassword;
  const setShowPassword = externalSetShowPassword || setInternalShowPassword;

  // Get current field value for watch pattern
  const currentValue = watch ? watch(actualFieldName) || "" : "";

  // ==========================================
  // CHARACTER COUNTER LOGIC
  // ==========================================
  const getCharacterCount = (value) => {
    const count = value?.length || 0;
    const percentage = (count / maxLength) * 100;

    let color = normalColor;
    if (percentage > errorThreshold) {
      color = errorColor;
    } else if (percentage > warningThreshold) {
      color = warningColor;
    }

    return {
      count,
      percentage,
      color,
      remaining: maxLength - count,
      isWarning: percentage > warningThreshold,
      isError: percentage > errorThreshold,
      isAtLimit: count >= maxLength,
    };
  };

  const formatCounterText = (count) => {
    switch (counterFormat) {
      case "remaining":
        return `${maxLength - count} remaining`;
      case "percentage":
        return `${Math.round((count / maxLength) * 100)}%`;
      case "fraction":
      default:
        return `${count}/${maxLength}`;
    }
  };

  const counterData = getCharacterCount({ length: charCount });

  const counterStyling = {
    fontWeight: 500,
    px: 1,
    py: 0.5,
    borderRadius: 1,
    bgcolor: `${theme.palette[counterData.color].main}15`,
    color: counterData.color,
    transition: "all 0.2s ease-in-out",
    fontSize: "0.75rem",
  };

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    if (watch) {
      const value = watch(actualFieldName) || "";
      setCharCount(value.length);
      setShowClear(value.length > 0);
    }
  }, [watch, actualFieldName, currentValue]);

  useEffect(() => {
    if (inputRef?.current?.value && !watch) {
      const value = inputRef.current.value;
      setCharCount(value.length);
      setShowClear(value.length > 0);
    }
  }, [inputRef, watch]);

  // ==========================================
  // EVENT HANDLERS
  // ==========================================
  const handleClear = useCallback(() => {
    if (controllerField) {
      controllerField.onChange("");
      setCharCount(0);
      setShowClear(false);
      return;
    }

    if (inputRef?.current) {
      inputRef.current.value = "";
      inputRef.current.dispatchEvent(new Event("input", { bubbles: true }));
    }

    if (setValue) {
      setValue(actualFieldName, "", {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });
    }

    setCharCount(0);
    setShowClear(false);
  }, [controllerField, inputRef, setValue, actualFieldName]);

  const handleChange = useCallback(
    (e) => {
      const value = e.target.value;

      if (preventZero && value === "0") return;
      if (value.length > maxLength) return;

      if (!watch) {
        setCharCount(value.length);
        setShowClear(value.length > 0);
      }

      if (register?.(actualFieldName)?.onChange) {
        register(actualFieldName).onChange(e);
      }
    },
    [preventZero, maxLength, watch, register, actualFieldName]
  );

  const handleFocus = useCallback(
    (e) => {
      if (restProps.onFocus) {
        restProps.onFocus(e);
      }
    },
    [restProps]
  );

  const handleTogglePasswordVisibility = useCallback(() => {
    setShowPassword(!showPassword);
  }, [showPassword, setShowPassword]);

  // ==========================================
  // END ADORNMENT LOGIC
  // ==========================================
  const getEndAdornment = () => {
    const elements = [];

    // Add character counter to end adornment (behind textfield)
    if (showCounter && !isPasswordField) {
      elements.push(
        <Typography
          key="counter"
          variant="caption"
          sx={{
            ...counterStyling,
            mr: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
          aria-live="polite"
          aria-label={`Character count: ${charCount} of ${maxLength}`}
        >
          {formatCounterText(charCount)}
        </Typography>
      );
    }

    // Add clear button (if enabled and not date type)
    if (showClear && showClearButton && type !== "date") {
      elements.push(
        <IconButton
          key="clear"
          aria-label={`Clear ${actualFieldName}`}
          onClick={handleClear}
          disabled={loading}
          edge="end"
          size="small"
          sx={{
            opacity: showClear ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            color: "text.secondary",
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          <ClearIcon fontSize="small" />
        </IconButton>
      );
    }

    // Add password visibility toggle (for password fields, if enabled and has content)
    if (isPasswordField && showPasswordToggle && showClear) {
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
            opacity: showClear ? 1 : 0,
            transition: "all 0.2s ease",
            color: "text.secondary",
            "&:hover": {
              color: theme.palette.primary.main,
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
          }}
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      );
    }

    // If custom endAdornment is provided, add it
    if (endAdornment) {
      elements.push(
        <React.Fragment key="custom-endAdornment">
          {endAdornment}
        </React.Fragment>
      );
    }

    return elements.length > 0 ? (
      <InputAdornment position="end">{elements}</InputAdornment>
    ) : null;
  };

  // ==========================================
  // COMMON TEXTFIELD PROPS
  // ==========================================
  const getCommonTextFieldProps = () => ({
    label: actualLabel,
    type: isPasswordField ? (showPassword ? "text" : "password") : type,
    margin,
    variant: "outlined",
    fullWidth: true,
    multiline,
    rows,
    disabled: loading,
    autoComplete: isPasswordField ? "new-password" : "off",
    slotProps: {
      htmlInput: {
        maxLength,
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
        endAdornment: getEndAdornment(),
      },
      inputLabel: {
        ...(type === "date" && { shrink: true }),
      },
    },
    sx: {
      flex: flex,
      // Enhanced styling from MyViewEditField
      "& .MuiOutlinedInput-root": {
        borderRadius: 2,
        transition: "all 0.2s",
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: theme.palette.primary.main,
          borderWidth: "1px",
        },
      },
      // Password field autofill styling and hide native reveal
      ...(isPasswordField && {
        "& input:-webkit-autofill": {
          WebkitBoxShadow: `0 0 0 100px ${
            theme.palette.mode === "dark"
              ? "rgb(30, 30, 30)"
              : theme.palette.background.default
          } inset !important`,
        },
        "& input[type='password']::-ms-reveal": {
          display: "none",
        },
        "& input[type='password']::-webkit-credentials-auto-fill-button": {
          display: "none !important",
        },
        "& input[type='password']::-webkit-strong-password-auto-fill-button": {
          display: "none !important",
        },
      }),
      // Date picker styling
      ...(type === "date" && {
        "& input[type='date']::-webkit-calendar-picker-indicator": {
          filter: "invert(25%) sepia(100%) saturate(500%) hue-rotate(200deg)",
        },
      }),
      "@keyframes pulse": {
        "0%": { opacity: 1 },
        "50%": { opacity: 0.7 },
        "100%": { opacity: 1 },
      },
      ...restProps.sx,
    },
    onFocus: handleFocus,
    ...restProps,
  });

  // Don't render if hidden
  if (hidden) {
    return null;
  }

  // ==========================================
  // READ-ONLY VIEW MODE
  // ==========================================
  if (readOnly) {
    // Get the current value from form or passed value
    let displayValue = value;

    // If no value prop passed, try to get from form
    if (!displayValue && control) {
      const formValues = control._formValues || control._defaultValues || {};
      displayValue = formValues[actualFieldName];
    }

    // If still no value and watch is available, get from watch
    if (!displayValue && watch) {
      displayValue = watch(actualFieldName);
    }

    return (
      <Box sx={{ width: "100%", mb: 2.5 }}>
        <Stack direction="row" sx={{ alignItems: "center" }} spacing={2}>
          <Typography
            variant="subtitle2"
            color="info.light"
            sx={{ minWidth: 120, fontWeight: "bold" }}
          >
            {actualLabel}
          </Typography>
          <Typography
            variant="body1"
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: (theme) =>
                theme.palette.mode === "dark"
                  ? alpha(theme.palette.primary.main, 0.08)
                  : alpha(theme.palette.info.light, 0.08),
              color: "text.primary",
              flexGrow: 1,
              transition: "all 0.2s ease-in-out",
              boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
              border: (theme) =>
                `1px solid ${alpha(theme.palette.info.light, 0.2)}`,
              "&:hover": {
                bgcolor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.info.light, 0.12),
                boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
              },
            }}
          >
            {/* For password fields in readOnly mode, mask the value */}
            {type === "password"
              ? displayValue
                ? "••••••••••"
                : "-"
              : displayValue || "-"}
          </Typography>
        </Stack>
      </Box>
    );
  }

  // ==========================================
  // RENDER COMPONENT
  // ==========================================
  const renderTextField = () => {
    const commonProps = getCommonTextFieldProps();

    // Use Controller pattern if control is provided
    if (control) {
      return (
        <Controller
          name={actualFieldName}
          control={control}
          render={({ field }) => {
            const fieldValue = field.value || "";

            // Use useEffect to update controllerField to avoid setState during render
            useEffect(() => {
              if (controllerField !== field) {
                setControllerField(field);
              }
            }, [field]);

            // Update character count when field value changes
            useEffect(() => {
              if (charCount !== fieldValue.length) {
                setCharCount(fieldValue.length);
                setShowClear(fieldValue.length > 0);
              }
            }, [fieldValue.length]);

            return (
              <TextField
                {...field}
                {...commonProps}
                error={!!errors[actualFieldName]}
                helperText={errors[actualFieldName]?.message}
                onChange={(e) => {
                  const value = e.target.value;
                  if (preventZero && value === "0") return;
                  if (value.length > maxLength) return;

                  setCharCount(value.length);
                  setShowClear(value.length > 0);
                  field.onChange(value);
                }}
              />
            );
          }}
        />
      );
    }

    // Use register pattern
    return (
      <TextField
        {...commonProps}
        error={!!errors[actualFieldName]}
        helperText={errors[actualFieldName]?.message}
        {...register}
        inputRef={inputRef}
        value={value !== undefined ? value : undefined}
        onChange={handleChange}
      />
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
      {/* TextField with counter inside */}
      {renderTextField()}

      {/* Optional: External counter label below (only if counterLabel is provided) */}
      {showCounter && !isPasswordField && counterLabel && (
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mt: 0.5,
            px: 1,
          }}
        >
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {counterLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default MyTextField;
