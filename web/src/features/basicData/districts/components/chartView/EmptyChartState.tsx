import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import { Add, BarChart } from '@mui/icons-material';

interface EmptyChartStateProps {
  t: (key: string) => string;
  onAdd?: () => void;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ t, onAdd }) => {
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
          <BarChart
            sx={{
              fontSize: 80,
              color: 'text.disabled',
              mb: 2
            }}
          />
          <Typography variant="h5" color="text.secondary" gutterBottom>
            {t('No Districts Data')}
          </Typography>
          <Typography variant="body1" color="text.disabled" sx={{ mb: 3, maxWidth: 400 }}>
            {t('There are no districts to display in the chart view. Add some districts to see the analytics and visualizations.')}
          </Typography>
          {onAdd && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={onAdd}
              size="large"
            >
              {t('Add District')}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default EmptyChartState;