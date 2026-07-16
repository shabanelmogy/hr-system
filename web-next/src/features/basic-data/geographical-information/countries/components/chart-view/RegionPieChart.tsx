import React from 'react';
import { useTranslation } from 'react-i18next';
import { PieChart } from '@/shared/components/charts';
import { COLOR_PALETTES } from '@/shared/components/charts';

interface RegionData {
  name: string;
  value: number;
}

interface RegionPieChartProps {
  data: RegionData[];
  colors: string[];
}

const RegionPieChart: React.FC<RegionPieChartProps> = ({ data, colors }) => {
  const { t } = useTranslation();
  return (
    <PieChart
      data={data}
      title={t("countries.charts.regionDistribution") || "Region Distribution"}
      nameKey="name"
      valueKey="value"
      height={400}
      colors={colors.length > 0 ? colors : COLOR_PALETTES.rainbow}
      showLegend={false}
      showTooltip={true}
      showLabels={true}
      outerRadius={120}
      formatValue={(value) => String(value)}
      formatLabel={(label) => String(label ?? '')}
      customLabel={({ name, percent = 0 }) =>
        `${String(name ?? '')} ${(percent * 100).toFixed(0)}%`
      }
      subtitle={undefined}    />
  );
};

export default RegionPieChart;
