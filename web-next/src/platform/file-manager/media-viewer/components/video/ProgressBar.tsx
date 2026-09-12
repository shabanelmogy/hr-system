import React from 'react';
import { Box, Slider } from '@mui/material';

interface ProgressBarProps {
  value: number;
  max: number;
  disabled: boolean;
  onChange: (_: Event, newValue: number | number[]) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, max, disabled, onChange }) => {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Slider
        value={value}
        onChange={onChange}
        max={max}
        step={0.1}
        disabled={disabled}
        sx={{
          color: '#fff',
          '& .MuiSlider-thumb': {
            width: 12,
            height: 12,
            backgroundColor: '#fff',
            transition: '0.3s cubic-bezier(.47,.1,.89,.6)',
            '&:hover': {
              boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.2)',
            },
          },
          '& .MuiSlider-track': {
            backgroundColor: '#fff',
          },
          '& .MuiSlider-rail': {
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
          },
        }}
      />
    </Box>
  );
};
