import React from 'react';
import { useTranslation } from 'react-i18next';
import { Public } from '@mui/icons-material';
import { EmptyChartState as ReusableEmptyChartState } from '@/shared/components/feedback';

interface EmptyChartStateProps {
  onAdd?: () => void;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ onAdd }) => {
  const { t } = useTranslation();
  return (
    <ReusableEmptyChartState
      title={t("countries.charts.title") || "Countries Analytics"}
      message={t("countries.charts.noData") || "No Countries Data Available"}
      subtitle={t("countries.noDataDescription") || "Start by adding your first country to see analytics and insights"}
      chartIcon={Public}
      emptyIcon={Public}
      actionText={onAdd ? (t("countries.addFirst") || "Add Your First Country") : undefined}
      onAction={onAdd}
      showRefresh={false}
      height={400}
    />
  );
};

export default EmptyChartState;
