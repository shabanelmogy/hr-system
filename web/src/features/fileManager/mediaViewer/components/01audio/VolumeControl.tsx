import React from "react";
import { Box, IconButton, Slider } from "@mui/material";
import {
  VolumeUp as VolumeUpIcon,
  VolumeOff as VolumeOffIcon,
} from "@mui/icons-material";

export interface VolumeControlProps {
  volume: number;
  isMuted: boolean;
  onChange: (_: Event, newValue: number | number[]) => void;
  onToggleMute: () => void;
  pulseAnim?: string;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
  volume,
  isMuted,
  onChange,
  onToggleMute,
  pulseAnim,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        minWidth: { xs: 40, sm: 120 },
      }}
    >
      <IconButton
        onClick={onToggleMute}
        size="small"
        sx={{
          animation: pulseAnim || "none",
          transition: "all 0.2s ease",
          width: { xs: 32, sm: 40 },
          height: { xs: 32, sm: 40 },
          "&:hover": { transform: "scale(1.1)" },
        }}
      >
        {isMuted ? (
          <VolumeOffIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
        ) : (
          <VolumeUpIcon sx={{ fontSize: { xs: 18, sm: 24 } }} />
        )}
      </IconButton>
      <Slider
        value={isMuted ? 0 : volume}
        onChange={onChange}
        min={0}
        max={1}
        step={0.05}
        sx={{
          width: { xs: 60, sm: 80 },
          display: { xs: "none", sm: "block" },
          "& .MuiSlider-thumb": {
            transition: "all 0.3s ease",
            width: { xs: 16, sm: 20 },
            height: { xs: 16, sm: 20 },
            "&:hover": {
              transform: "scale(1.2)",
              boxShadow: "0 0 10px rgba(25, 118, 210, 0.5)",
            },
          },
        }}
      />
    </Box>
  );
};

export default VolumeControl;
