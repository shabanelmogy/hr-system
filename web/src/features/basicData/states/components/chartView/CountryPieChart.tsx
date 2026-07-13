import React from 'react';
import { PieChart } from '../../../../../shared/components/charts';
import { COLOR_PALETTES } from '../../../../../shared/components/charts/chartUtils';

interface CountryData {
  name: string;
  value: number;
  nameAr?: string;
}

interface CountryPieChartProps {
  data: CountryData[];
  colors: string[];
  t: (key: string) => string;
}

const CountryPieChart: React.FC<CountryPieChartProps> = ({ data, colors, t }) => {
  return (
    <PieChart
      data={data}
      title={t("states.charts.statesByCountry") || "States Distribution by Country"}
      nameKey="name"
      valueKey="value"
      height={400}
      colors={colors.length > 0 ? colors : COLOR_PALETTES.rainbow}
      showLegend={false}
      showTooltip={true}
      showLabels={true}
      outerRadius={120}
      formatValue={(value) => value.toString()}
      formatLabel={(label) => label}
      customLabel={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
      subtitle={undefined}
    />
  );
};

export default CountryPieChart;