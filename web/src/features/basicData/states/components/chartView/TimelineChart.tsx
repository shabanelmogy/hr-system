import { AreaChart } from '@/shared/components/charts';
import { COLOR_PALETTES } from '@/shared/components/charts/chartUtils';
import React from 'react';

interface TimelineData {
  month: string;
  count: number;
  cumulative: number;
}

interface TimelineChartProps {
  data: TimelineData[];
  t: (key: string) => string;
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data, t }) => {
  if (data.length === 0) {
    return null;
  }

  return (
    <AreaChart
      data={data}
      title={t("states.charts.timeline") || "States Added Over Time"}
      xKey="month"
      yKey="cumulative"
      height={400}
      colors={COLOR_PALETTES.success}
      showGrid={true}
      showTooltip={true}
      gradient={true}
      strokeWidth={2}
      fillOpacity={0.3}
      formatValue={(value) => value.toString()}
      formatLabel={(label) => label}
      subtitle={undefined}
    />
  );
};

export default TimelineChart;