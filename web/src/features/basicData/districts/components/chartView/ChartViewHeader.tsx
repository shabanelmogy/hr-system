import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Add, Refresh } from '@mui/icons-material';

interface ChartViewHeaderProps {
  title: string;
  subtitle?: string;
  onAdd?: () => void;
  onRefresh?: () => void;
  t: (key: string) => string;
}

const ChartViewHeader: React.FC<ChartViewHeaderProps> = ({
  title,
  subtitle,
  onAdd,
  onRefresh,
  t
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}
    >
      <Box>
        <Typography variant="h4" component="h1" gutterBottom>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body1" color="text.secondary">
            {subtitle}
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', gap: 1 }}>
        {onRefresh && (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
          >
            {t('Refresh')}
          </Button>
        )}
        {onAdd && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onAdd}
          >
            {t('Add District')}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ChartViewHeader;