import React from 'react';
import { LocationOn } from '@mui/icons-material';
import { EmptyChartState as ReusableEmptyChartState } from '@/shared/components/common/feedback';

interface EmptyChartStateProps {
  t: (key: string) => string;
  onAdd?: () => void;
}

const EmptyChartState: React.FC<EmptyChartStateProps> = ({ t, onAdd }) => {
  return (
    <ReusableEmptyChartState
      title={t("states.charts.title") || "States Analytics"}
      message={t("states.charts.noData") || "No States Data Available"}
      subtitle={t("states.noDataDescription") || "Start by adding your first state to see analytics and insights"}
      chartIcon={LocationOn}
      emptyIcon={LocationOn}
      actionText={onAdd ? (t("states.addFirst") || "Add Your First State") : undefined}
      onAction={onAdd}
      showRefresh={true}
      onRefresh={() => window.location.reload()}
      height={400}
    />
  );
};

export default EmptyChartState;