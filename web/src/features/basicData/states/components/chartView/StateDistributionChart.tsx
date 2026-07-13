import React from 'react';
import { BarChart } from '../../../../../shared/components/charts';
import { COLOR_PALETTES } from '../../../../../shared/components/charts/chartUtils';

interface StateDistributionData {
  name: string;
  value: number;
}

interface StateDistributionChartProps {
  data: StateDistributionData[];
  t: (key: string) => string;
}

const StateDistributionChart: React.FC<StateDistributionChartProps> = ({ data, t }) => {
  return (
    <BarChart
      data={data}
      title={t("states.charts.distributionMetric") || "State Distribution"}
      xKey="name"
      yKey="value"
      height={400}
      colors={COLOR_PALETTES.secondary}
      showGrid={true}
      showTooltip={true}
      barRadius={4}
      orientation="vertical"
      formatValue={(value) => value.toString()}
      formatLabel={(label) => label}
      subtitle={undefined}
    />
  );
};

export default StateDistributionChart;