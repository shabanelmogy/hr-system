import React from 'react';
import { BarChart } from '../../../../../shared/components/charts';
import { COLOR_PALETTES } from '../../../../../shared/components/charts/chartUtils';

interface CountryData {
  name: string;
  value: number;
  nameAr?: string;
}

interface CountryBarChartProps {
  data: CountryData[];
  t: (key: string) => string;
}

const CountryBarChart: React.FC<CountryBarChartProps> = ({ data, t }) => {
  return (
    <BarChart
      data={data}
      title={t("states.charts.statesByCountry") || "States by Country"}
      xKey="name"
      yKey="value"
      height={400}
      colors={COLOR_PALETTES.primary}
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

export default CountryBarChart;