import { BarChart } from '@/shared/components/charts';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface CurrencyData {
  name: string;
  value: number;
}

interface CurrencyChartProps {
  data: CurrencyData[];
}

const CurrencyChart: React.FC<CurrencyChartProps> = ({ data }) => {
  const { t } = useTranslation();
  return (
    <BarChart
      data={data}
      title={t("countries.charts.topCurrencies") || "Top Currencies"}
      xKey="name"
      yKey="value"
      height={400}
      colors="secondary"
      showGrid={true}
      showTooltip={true}
      barRadius={4}
      orientation="horizontal"
      formatValue={(value) => value.toString()}
      formatLabel={(label) => label}
      subtitle={undefined} />
  );
};

export default CurrencyChart;
