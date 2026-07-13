import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

interface ChartViewHeaderProps {
  title: string;
  subtitle?: string;
}

const ChartViewHeader: React.FC<ChartViewHeaderProps> = ({ title, subtitle }) => {
  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h4" color="primary.main" fontWeight="bold" gutterBottom>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body1" color="text.secondary">
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
};

export default ChartViewHeader;