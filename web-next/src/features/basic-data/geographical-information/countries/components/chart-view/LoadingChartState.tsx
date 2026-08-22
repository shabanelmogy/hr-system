import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChartContainer } from '@/shared/components/charts';

const LoadingChartState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ChartContainer
      title={t("countries.charts.title")}
      loading={true}
      height={200}
      compact
      subtitle={undefined}
    />
  );
};

export default LoadingChartState;
