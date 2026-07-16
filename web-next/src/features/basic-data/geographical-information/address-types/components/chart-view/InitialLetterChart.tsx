import { BarChart } from '@/shared/components/charts';
import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';
import { InitialLetterChartProps } from './AddressTypeChart.types';

const InitialLetterChart: React.FC<InitialLetterChartProps> = ({ data, t }) => {
  return (
    <Card elevation={2}>
      <CardHeader 
        title={t("addressTypes.charts.byInitialLetter") || "Address Types by Initial Letter"}
        slotProps={{ title: { variant: 'h6', fontWeight: 600 } }}
      />
      <CardContent>
        <BarChart
          data={data}
          xKey="name"
          yKey="value"
          title=""
          subtitle=""
          height={300}
          colors="info"
          showGrid={true}
          showTooltip={true}
        />
      </CardContent>
    </Card>
  );
};

export default InitialLetterChart;
