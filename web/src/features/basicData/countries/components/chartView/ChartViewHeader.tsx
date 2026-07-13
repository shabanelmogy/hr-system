import React from 'react';
import { Box, Typography } from '@mui/material';

interface ChartViewHeaderProps {
  title?: string;
  subtitle?: string;
}

const ChartViewHeader: React.FC<ChartViewHeaderProps> = ({ 
  title = "Countries Analytics", 
  subtitle = "Visual insights and statistics" 
}) => {
  return (
    <Box sx={{ mb: 4, textAlign: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {subtitle}
      </Typography>
    </Box>
  );
};

export default ChartViewHeader;