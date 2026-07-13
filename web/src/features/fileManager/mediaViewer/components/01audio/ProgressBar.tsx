import React from "react";
import { Slider } from "@mui/material";

export interface ProgressBarProps {
  value: number;
  max: number;
  onChange: (_: Event, newValue: number | number[]) => void;
  playingGlow?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, onChange, playingGlow }) => {
  return (
    <Slider
      value={value}
      onChange={onChange}
      max={max || 100}
      sx={{
        mb: 1,
        '& .MuiSlider-thumb': {
          animation: playingGlow || 'none',
          transition: 'all 0.3s ease',
          '&:hover': { transform: 'scale(1.2)' }
        }
      }}
    />
  );
};

export default ProgressBar;
