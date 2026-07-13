import React from "react";
import { Tooltip, IconButton, Typography } from "@mui/material";

export interface SkipButtonProps {
  title: string;
  delta: number;
  onSkip: (delta: number) => void;
  size?: "small" | "medium" | "large";
  btnSize?: number | { xs?: number; sm?: number };
  label?: string; // overrides icon with text like -10, +10
}

const SkipButton: React.FC<SkipButtonProps> = ({
  title,
  delta,
  onSkip,
  size = "small",
  btnSize = { xs: 32, sm: 40 },
  label,
}) => {
  return (
    <Tooltip title={title}>
      <IconButton
        onClick={() => onSkip(delta)}
        size={size}
        sx={{ width: btnSize as any, height: btnSize as any }}
      >
        <Typography sx={{ fontSize: "0.6rem", fontWeight: 600 }}>
          {label ?? (delta > 0 ? `+${delta}` : `${delta}`)}
        </Typography>
      </IconButton>
    </Tooltip>
  );
};

export default SkipButton;
