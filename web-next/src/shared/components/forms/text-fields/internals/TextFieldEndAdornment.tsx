import { Visibility, VisibilityOff } from "@mui/icons-material";
import { alpha, IconButton, InputAdornment, Typography, useTheme } from "@mui/material";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { CharacterCount } from "./characterCount";
import ClearFieldButton from "./ClearFieldButton";

type TextFieldEndAdornmentProps = {
  fieldName: string;
  value: unknown;
  type: string;
  loading: boolean;
  isPassword: boolean;
  showPassword: boolean;
  showPasswordToggle: boolean;
  showClearButton: boolean;
  showCounter: boolean;
  counter: CharacterCount;
  counterText: string;
  customAdornment?: ReactNode;
  appearance: "enhanced" | "plain";
  clearButtonAriaLabel?: string;
  onClear: () => void;
  onTogglePassword: () => void;
};

export default function TextFieldEndAdornment(props: TextFieldEndAdornmentProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const value = String(props.value ?? "");
  const paletteColor = (theme.palette as unknown as Record<string, { main?: string }>)[props.counter.color]?.main
    ?? theme.palette.primary.main;

  const hasContent =
    (props.showCounter && !props.isPassword) ||
    (value && props.showClearButton && props.type !== "date") ||
    (props.isPassword && props.showPasswordToggle && value) ||
    props.customAdornment;

  if (!hasContent) return null;

  return (
    <InputAdornment position="end">
      {props.showCounter && !props.isPassword && (
        <Typography
          id={`${props.fieldName}-counter`}
          variant="caption"
          sx={{
            fontWeight: 500,
            px: 1,
            py: 0.5,
            borderRadius: 1,
            bgcolor: alpha(paletteColor, 0.08),
            color: paletteColor,
            transition: "all 0.2s ease-in-out",
            fontSize: "0.75rem",
            mr: 1,
            userSelect: "none",
            pointerEvents: "none",
          }}
          aria-live="polite"
          aria-label={`Character count: ${props.counterText}`}
        >
          {props.counterText}
        </Typography>
      )}
      {Boolean(value) && props.showClearButton && props.type !== "date" && (
        <ClearFieldButton
          type="button"
          ariaLabel={props.clearButtonAriaLabel ?? `Clear ${props.fieldName}`}
          onClick={props.onClear}
          disabled={props.loading}
          edge="end"
          size={props.appearance === "plain" ? undefined : "small"}
          iconSize={props.appearance === "plain" ? "medium" : "small"}
          sx={props.appearance === "plain"
            ? undefined
            : { color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
        />
      )}
      {props.isPassword && props.showPasswordToggle && Boolean(value) && (
        <IconButton
          type="button"
          onClick={props.onTogglePassword}
          edge="end"
          size="small"
          disabled={props.loading}
          aria-label={props.showPassword
            ? t("hidePassword", { field: props.fieldName }) || "Hide password"
            : t("showPassword", { field: props.fieldName }) || "Show password"}
          sx={{ color: "text.secondary", "&:hover": { color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) } }}
        >
          {props.showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      )}
      {props.customAdornment}
    </InputAdornment>
  );
}
