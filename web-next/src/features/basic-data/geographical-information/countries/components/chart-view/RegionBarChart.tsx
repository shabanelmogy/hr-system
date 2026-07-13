import React from 'react';
import { useTranslation } from 'react-i18next';
import { BarChart } from '@/shared/components/charts';

interface RegionData {
  name: string;
  value: number;
}

interface RegionBarChartProps {
  data: RegionData[];
}

const RegionBarChart: React.FC<RegionBarChartProps> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <BarChart
      data={data}
      title={t("countries.charts.byRegion") || "Countries by Region"}
      xKey="name"
      yKey="value"
      height={400}
      colors="primary"
      showGrid={true}
      showTooltip={true}
      barRadius={4}
      orientation="vertical"
      formatValue={(value) => value.toString()}
      formatLabel={(label) => label} 
      subtitle={undefined}    />
  );
};

export default RegionBarChart;
