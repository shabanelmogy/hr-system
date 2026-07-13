import { BarChart } from '@/shared/components/charts';
import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';
import { NameLengthChartProps } from './AddressTypeChart.types';

const NameLengthChart: React.FC<NameLengthChartProps> = ({ data, t }) => {
  return (
    <Card elevation={2}>
      <CardHeader 
        title={t("addressTypes.charts.nameLength") || "Name Length Distribution"}
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
          colors="purple"
          showGrid={true}
          showTooltip={true}
        />
      </CardContent>
    </Card>
  );
};

export default NameLengthChart;