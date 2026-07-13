import { Card, CardContent, Typography, Box } from '@mui/material';
import React from 'react';
import { LoadingChartStateProps } from './AddressTypeChart.types';

const LoadingChartState: React.FC<LoadingChartStateProps> = ({ t }) => {
  return (
    <Card elevation={2} sx={{ minHeight: 400, display: 'flex', alignItems: 'center' }}>
      <CardContent sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography variant="body1" color="text.secondary">
            {t("general.loading") || "Loading address types analytics..."}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoadingChartState;