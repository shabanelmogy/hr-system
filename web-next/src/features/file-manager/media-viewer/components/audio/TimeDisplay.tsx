import React from "react";
import { Box, Typography } from "@mui/material";

export interface TimeDisplayProps {
  currentTime: number;
  duration: number;
  formatTime: (s: number) => string;
}

const TimeDisplay: React.FC<TimeDisplayProps> = ({
  currentTime,
  duration,
  formatTime,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: { xs: 80, sm: 100 },
      }}
    >
      <Typography
        variant="caption"
        sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
      >
        {formatTime(currentTime)}
      </Typography>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontSize: { xs: "0.7rem", sm: "0.75rem" },
        }}
      >
        /
      </Typography>
      <Typography
        variant="caption"
        sx={{ fontSize: { xs: "0.7rem", sm: "0.75rem" } }}
      >
        {formatTime(duration)}
      </Typography>
    </Box>
  );
};

export default TimeDisplay;
