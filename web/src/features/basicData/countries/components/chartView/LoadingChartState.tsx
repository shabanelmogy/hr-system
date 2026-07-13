import React from 'react';
import { useTranslation } from 'react-i18next';
import { ChartContainer } from '../../../../../shared/components/charts';

const LoadingChartState: React.FC = () => {
  const { t } = useTranslation();
  return (
    <ChartContainer
      title={t("countries.charts.title") || "Countries Analytics"}
      loading={true}
      height={400}
      subtitle={undefined}
      children={undefined}
    >
    </ChartContainer>
  );
};

export default LoadingChartState;