import { EmptyChartState as ReusableEmptyChartState } from "@/shared/components/feedback/states";
import { LocationOn } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface EmptyChartStateProps {
  onAdd?: () => void;
}

const EmptyChartState = ({ onAdd }: EmptyChartStateProps) => {
  const { t } = useTranslation();

  return (
    <ReusableEmptyChartState
      title={t("states.charts.title")}
      message={t("states.charts.noData")}
      subtitle={t("states.noDataDescription")}
      chartIcon={LocationOn}
      emptyIcon={LocationOn}
      actionText={onAdd ? t("states.addFirstState") : undefined}
      onAction={onAdd}
      height={400}
    />
  );
};

export default EmptyChartState;
