import { Sync } from "@mui/icons-material";
import { Backdrop, Box, CircularProgress, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import React, { type ReactElement } from "react";

export type LoaderIcon = ReactElement<{ sx?: SxProps<Theme> }>;

export interface MyOverlayLoaderProps {
  open?: boolean;
  message?: string;
  customIcon?: LoaderIcon | null;
  customColor?: string | null;
  spinnerSize?: number;
  spinnerThickness?: number;
  backgroundColor?: string;
  zIndex?: number | null;
}

export const MyOverlayLoader = ({
  open = false,
  message = "",
  customIcon = null,
  customColor = null,
  spinnerSize = 60,
  spinnerThickness = 4,
  backgroundColor = "rgba(0, 0, 0, 0.7)",
  zIndex = null,
}: MyOverlayLoaderProps) => {
  const displayMessage = message || "Processing...";
  const defaultIcon = (
    <Sync sx={{ fontSize: 48, color: customColor || "primary.main", mb: 1 }} />
  );
  const finalIcon = customIcon
    ? customColor
      ? React.cloneElement(customIcon, {
        sx: customIcon.props.sx
            ? ([customIcon.props.sx, { color: customColor }] as SxProps<Theme>)
            : { color: customColor },
        })
      : customIcon
    : defaultIcon;

  return (
    <Backdrop
      open={open}
      role="status"
      aria-live="polite"
      aria-label={displayMessage}
      sx={{
        color: "#fff",
        zIndex: zIndex ?? ((theme) => theme.zIndex.modal + 1),
        backgroundColor,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        {finalIcon}

        <CircularProgress
          color="primary"
          size={spinnerSize}
          thickness={spinnerThickness}
          aria-hidden="true"
        />

        <Typography
          variant="h6"
          component="div"
          sx={{
            fontWeight: 500,
            textAlign: "center",
            color: "white",
          }}
        >
          {displayMessage}
        </Typography>
      </Box>
    </Backdrop>
  );
};

export default MyOverlayLoader;
