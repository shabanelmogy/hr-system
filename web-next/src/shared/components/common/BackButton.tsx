import React from "react";
import { IconButton, IconButtonProps, useTheme, Tooltip } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

export interface BackButtonProps extends Omit<IconButtonProps, "children"> {
  onClick: () => void;
  tooltip?: string;
  ariaLabel?: string;
}

/**
 * Reusable back button component with RTL support
 * Automatically displays the correct arrow direction based on theme direction
 * 
 * @example
 * ```tsx
 * <BackButton onClick={handleBack} tooltip="Go back" />
 * ```
 */
const BackButton: React.FC<BackButtonProps> = ({
  onClick,
  tooltip,
  ariaLabel,
  size = "small",
  ...props
}) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";
  
  const defaultTooltip = tooltip || t("actions.back") || "Back";
  const defaultAriaLabel = ariaLabel || t("actions.back") || "Back";

  return (
    <Tooltip title={defaultTooltip}>
      <IconButton
        onClick={onClick}
        size={size}
        aria-label={defaultAriaLabel}
        {...props}
      >
        {isRtl ? <ArrowForwardIcon /> : <ArrowBackIcon />}
      </IconButton>
    </Tooltip>
  );
};

export default BackButton;
