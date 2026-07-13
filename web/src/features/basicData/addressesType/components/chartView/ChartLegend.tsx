import { Card, CardContent, CardHeader, Chip, Stack } from '@mui/material';
import React from 'react';
import { ChartLegendProps } from './AddressTypeChart.types';

const ChartLegend: React.FC<ChartLegendProps> = ({ data, colors }) => {
  if (!data || data.length === 0) return null;

  return (
    <Card elevation={1} sx={{ mt: 3 }}>
      <CardHeader 
        title="Chart Legend"
        slotProps={{ title: { variant: 'h6', fontWeight: 600 } }}
      />
      <CardContent>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: "wrap" }}>
          {data.map((item, index) => (
            <Chip
              key={item.name}
              label={`${item.name}: ${item.value}`}
              sx={{
                backgroundColor: colors[index % colors.length],
                color: 'white',
                fontWeight: 500,
              }}
              size="small"
            />
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ChartLegend;