import { AreaChart } from '@/shared/components/charts';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface TimelineData {
  month: string;
  count: number;
  cumulative: number;
}

interface TimelineChartProps {
  data: TimelineData[];
}

const TimelineChart: React.FC<TimelineChartProps> = ({ data }) => {
  const { t } = useTranslation();
  if (data.length === 0) {
    return null;
  }

  return (
    <AreaChart
      data={data}
      title={t("countries.charts.timeline") || "Countries Added Over Time"}
      xKey="month"
      yKey="cumulative"
      height={400}
      colors="success"
      showGrid={true}
      showTooltip={true}
      gradient={true}
      strokeWidth={2}
      fillOpacity={0.3}
      formatValue={(value) => value.toString()}
      formatLabel={(label) => label}
      subtitle={undefined} />
  );
};

export default TimelineChart;
