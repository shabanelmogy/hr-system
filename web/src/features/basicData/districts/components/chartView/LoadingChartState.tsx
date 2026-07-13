import React from 'react';
import { Box, Typography, CircularProgress, Card, CardContent } from '@mui/material';

interface LoadingChartStateProps {
  t: (key: string) => string;
}

const LoadingChartState: React.FC<LoadingChartStateProps> = ({ t }) => {
  return (
    <Card sx={{ minHeight: 400 }}>
      <CardContent>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 300,
            textAlign: 'center',
            py: 4
          }}
        >
          <CircularProgress
            size={60}
            sx={{ mb: 2 }}
          />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {t('Loading Districts Data')}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            {t('Please wait while we prepare the chart visualizations...')}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoadingChartState;