import { PieChart } from '@/shared/components/charts';
import { Card, CardContent, CardHeader } from '@mui/material';
import React from 'react';
import { LanguageDistributionChartProps } from './AddressTypeChart.types';

const LanguageDistributionChart: React.FC<LanguageDistributionChartProps> = ({ data, t }) => {
  return (
    <Card elevation={2}>
      <CardHeader
        title={t("addressTypes.charts.languageDistribution") || "Language Distribution"}
        slotProps={{ title: { variant: 'h6', fontWeight: 600 } }}
      />
      <CardContent>
        <PieChart
          data={data}
          nameKey="name"
          valueKey="value"
          title=""
          subtitle=""
          height={300}
          colors="rainbow"
          showLegend={true}
          showTooltip={true}
        />
      </CardContent>
    </Card>
  );
};

export default LanguageDistributionChart;