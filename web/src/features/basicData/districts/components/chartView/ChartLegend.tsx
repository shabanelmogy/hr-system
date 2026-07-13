import React from 'react';
import { Box, Card, CardContent, Typography, Chip } from '@mui/material';

interface ChartLegendProps {
  data: Array<{ name: string; count: number; value: number }>;
  colors: string[];
}

const ChartLegend: React.FC<ChartLegendProps> = ({ data, colors }) => {
  return (
    <Card sx={{ mt: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Legend
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {data.map((item, index) => (
            <Chip
              key={index}
              label={`${item.name} (${item.count})`}
              sx={{
                backgroundColor: colors[index % colors.length],
                color: 'white',
                fontWeight: 'bold',
                '&:hover': {
                  backgroundColor: colors[index % colors.length],
                  opacity: 0.8,
                }
              }}
            />
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ChartLegend;