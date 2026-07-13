import React from "react";
import { IconButton, IconButtonProps, useTheme, Tooltip } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
} from "@mui/icons-material";

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
  tooltip = "Back",
  ariaLabel = "Back",
  size = "small",
  ...props
}) => {
  const theme = useTheme();
  const isRtl = theme.direction === "rtl";

  const button = (
    <IconButton
      onClick={onClick}
      size={size}
      aria-label={ariaLabel}
      {...props}
    >
      {isRtl ? <ArrowForwardIcon /> : <ArrowBackIcon />}
    </IconButton>
  );

  if (tooltip) {
    return <Tooltip title={tooltip}>{button}</Tooltip>;
  }

  return button;
};

export default BackButton;
