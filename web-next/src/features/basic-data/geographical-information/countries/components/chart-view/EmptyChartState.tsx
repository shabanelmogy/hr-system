import React from 'react';
import { useTranslation } from 'react-i18next';
import { Public } from '@mui/icons-material';
import { EmptyChartState as ReusableEmptyChartState } from '@/shared/components/feedback/states';

interface EmptyChartStateProps {
  onAdd?: () => void;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ onAdd }) => {
  const { t } = useTranslation();
  return (
    <ReusableEmptyChartState
      title={t("countries.charts.title")}
      message={t("countries.charts.noData")}
      subtitle={t("countries.noDataDescription")}
      chartIcon={Public}
      emptyIcon={Public}
      actionText={onAdd ? t("countries.addFirstCountry") : undefined}
      onAction={onAdd}
      height={400}
    />
  );
};

export default EmptyChartState;
