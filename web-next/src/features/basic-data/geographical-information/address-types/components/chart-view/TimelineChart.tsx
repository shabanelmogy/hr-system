import { LineChart } from '@/shared/components/charts';
import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';
import { TimelineChartProps } from './AddressTypeChart.types';

const TimelineChart: React.FC<TimelineChartProps> = ({ data, t }) => {
  return (
    <Card elevation={2}>
      <CardHeader 
        title={t("addressTypes.charts.timeline") || "Address Types Added Over Time"}
        slotProps={{ title: { variant: 'h6', fontWeight: 600 } }}
      />
      <CardContent>
        <LineChart
          data={data}
          xKey="month"
          yKey="count"
          title=""
          subtitle=""
          height={300}
          colors="primary"
          showGrid={true}
          showTooltip={true}
        />
      </CardContent>
    </Card>
  );
};

export default TimelineChart;
